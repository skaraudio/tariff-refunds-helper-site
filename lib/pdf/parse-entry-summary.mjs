import pdf from 'pdf-parse';
import crypto from 'crypto';

// All 9903.01.XX codes are IEEPA tariffs (struck down by Supreme Court Feb 20, 2026)
const IEEPA_HTS_PATTERN = /^9903\.01\.\d{2}$/;

// Known IEEPA code descriptions — used as fallback when PDF description is unclear
const IEEPA_CODE_DESCRIPTIONS = {
   '9903.01.20': 'China/HK Fentanyl Emergency - IEEPA Duty (Feb 4, 2025)',
   '9903.01.21': 'China/HK Fentanyl - IEEPA Duty',
   '9903.01.22': 'Canada Fentanyl - 25% IEEPA Duty (Feb 4, 2025)',
   '9903.01.23': 'Mexico Fentanyl - 25% IEEPA Duty (Feb 4, 2025)',
   '9903.01.24': 'China/HK Fentanyl Emergency - IEEPA Duty (Mar 4, 2025+)',
   '9903.01.25': 'Reciprocal "Liberation Day" - Baseline 10% IEEPA Tariff (Apr 5, 2025+)',
   '9903.01.26': 'Reciprocal Country-Specific IEEPA Tariff',
   '9903.01.28': 'IEEPA-Reciprocal In-Transit Exclusion',
   '9903.01.63': 'IEEPA-Reciprocal China/HK/Macau Tariff',
};

// Legacy exports for backward compatibility
const IEEPA_HTS_CODES = Object.keys(IEEPA_CODE_DESCRIPTIONS);
const HTS_CODE_DESCRIPTIONS = IEEPA_CODE_DESCRIPTIONS;

// Chapter 99 HTS codes are 8-digit (XXXX.XX.XX), product codes are 10-digit (XXXX.XX.XXXX)
// This regex matches the HTS code at the start of a line, handling the no-space concatenation
const HTS_LINE_REGEX = /^(99\d{2}\.\d{2}\.\d{2}|\d{4}\.\d{2}\.\d{4})/;

// The duty amount is always the last number with 2 decimal places on the HTS line
const LAST_AMOUNT_REGEX = /([\d,]+\.\d{2})(?=[^\d.]*$)/;

// Rate appears before the duty amount: a percentage or "Free"
const RATE_REGEX = /(\d+(?:\.\d+)?%|Free)/g;

export const parseEntrySummary = async (fileBuffer) => {
   const pdfData = await pdf(fileBuffer);
   const text = pdfData.text;
   const lines = text.split('\n');

   const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

   // Validate this is a CBP Form 7501
   if (!text.includes('ENTRY SUMMARY') && !text.includes('CBP Form 7501')) {
      throw new Error('This does not appear to be a CBP Form 7501 Entry Summary');
   }

   const entryNumber = extractEntryNumber(lines);
   const filerCode = entryNumber ? entryNumber.substring(0, 3) : extractFilerCode(lines);
   const entryDate = extractEntryDate(lines);
   const countryOfOrigin = extractCountryOfOrigin(lines);
   const totalEnteredValue = extractTotalEnteredValue(lines);

   const allLineItems = extractAllLineItems(lines);
   const ieeepaLineItems = allLineItems.filter(
       (item) => item.isIEEPA && item.dutyAmount > 0
   );

   const totalRefundAmount = ieeepaLineItems.reduce((sum, item) => sum + item.dutyAmount, 0);
   const htsCodesFound = [...new Set(ieeepaLineItems.map((item) => item.htsCode))];

   // Format line items for API response (backward compatible shape)
   const lineItems = ieeepaLineItems.map((item) => ({
      htsCode: item.htsCode,
      dutyAmount: item.dutyAmount,
      rate: item.rate,
      description: item.description
   }));

   return {
      fileHash,
      entryNumber,
      filerCode,
      entryDate,
      countryOfOrigin,
      totalEnteredValue,
      lineItems,
      totalRefundAmount,
      htsCodesFound,
      rawText: text,
      isEligible: lineItems.length > 0
   };
};

/**
 * Extract entry number from the header row.
 * The header line looks like: "JG6-3953982-801 ABI/A03/17/250368180102/28/2025"
 * The entry number is in XXX-XXXXXXX-X format.
 */
const extractEntryNumber = (lines) => {
   for (const line of lines) {
      // Match the filer code / entry number format: 3 alphanumeric + dash + 7 digits + dash + 1 digit
      const match = line.match(/([A-Z0-9]{3}-\d{7}-\d)/);
      if (match) return match[1];
   }
   return null;
};

/**
 * Fallback filer code extraction from the "Filer Code" label.
 */
const extractFilerCode = (lines) => {
   const text = lines.join('\n');
   const match = text.match(/Filer\s*(?:Code|ID)\s*:?\s*([A-Z0-9]{3,4})/i);
   return match ? match[1] : null;
};

/**
 * Extract entry date (field 7) from the header row.
 * It's the last MM/DD/YYYY date on the entry number line.
 */
const extractEntryDate = (lines) => {
   for (const line of lines) {
      if (!/[A-Z0-9]{3}-\d{7}-\d/.test(line)) continue;
      // Find all dates on this line — entry date is the last one
      const dates = [...line.matchAll(/(\d{2}\/\d{2}\/\d{4})/g)];
      if (dates.length > 0) return dates[dates.length - 1][1];
   }
   return null;
};

/**
 * Extract country of origin (field 10) from the carrier/transport line.
 * Line format: "OOCL SOUTHAMPTON (EGLV)11CN03/05/2025"
 * After "Country of Origin" header, the data line has: carrier + mode + country + date
 */
const extractCountryOfOrigin = (lines) => {
   for (let i = 0; i < lines.length; i++) {
      if (/Country of Origin/i.test(lines[i]) && i + 1 < lines.length) {
         // The data line follows the header — extract 2-letter country code before a date
         const dataLine = lines[i + 1];
         const match = dataLine.match(/\d{2}([A-Z]{2})\d{2}\/\d{2}\/\d{4}/);
         if (match) return match[1];
      }
   }
   return null;
};

/**
 * Extract total entered value from "Total Entered Value (Invoice)" line.
 * Format: "Total Entered Value (Invoice)282,634.00"
 */
const extractTotalEnteredValue = (lines) => {
   for (const line of lines) {
      if (!line.includes('Total Entered Value')) continue;
      if (line.includes('Block 39') || line.includes('35.')) continue;
      const match = line.match(/([\d,]+\.\d{2})\s*$/);
      if (match) return parseFloat(match[1].replace(/,/g, ''));
   }
   return null;
};

/**
 * Core extraction: parse ALL tariff line items from the PDF text.
 * Each HTS code line in the CBP 7501 follows this column layout (concatenated without spaces):
 *   {HTS_CODE}{weight/value}{unit?}{entered_value}{rate%}{duty_amount}
 *
 * The duty amount is ALWAYS the last decimal number (X,XXX.XX) on the line.
 */
const extractAllLineItems = (lines) => {
   const lineItems = [];
   const seenEntries = new Set();

   for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const htsMatch = line.match(HTS_LINE_REGEX);
      if (!htsMatch) continue;

      const htsCode = htsMatch[1];

      // Skip fee lines (499/501) that might accidentally match
      if (/^(499|501)\s/.test(line)) continue;

      // Extract the duty amount — last decimal number on the line
      const remainder = line.substring(htsCode.length);
      const amountMatch = remainder.match(LAST_AMOUNT_REGEX);
      if (!amountMatch) continue;

      const dutyAmount = parseFloat(amountMatch[1].replace(/,/g, ''));

      // Extract rate — find the rate% or "Free" that precedes the duty amount
      const rate = extractRate(remainder);

      // Extract description from the preceding line(s)
      const description = extractDescription(lines, i, htsCode);

      // Determine if this is an IEEPA tariff
      const isIEEPA = IEEPA_HTS_PATTERN.test(htsCode);

      // Deduplicate: same HTS code + same duty amount on same entry = skip
      const key = `${htsCode}:${dutyAmount}`;
      if (seenEntries.has(key)) continue;
      seenEntries.add(key);

      lineItems.push({
         htsCode,
         dutyAmount,
         rate,
         description,
         isIEEPA,
      });
   }

   return lineItems;
};

/**
 * Extract the rate from the remainder of an HTS line.
 * The rate is the percentage or "Free" that appears just before the duty amount.
 * In concatenated text like "0.00 010%28,263.40", the rate is "10%".
 */
const extractRate = (text) => {
   const matches = [...text.matchAll(RATE_REGEX)];
   if (matches.length === 0) return null;
   // Take the last rate match — it's closest to the duty amount
   const lastRate = matches[matches.length - 1][1];
   // Clean up cases like "010%" → "10%", "0125%" → "125%"
   // This happens when entered value "0" is concatenated with rate "10%" → "010%"
   // But don't touch legitimate rates like "0.125%" or "0.3464%"
   if (lastRate !== 'Free' && /^0\d+%$/.test(lastRate)) {
      return lastRate.replace(/^0+/, '');
   }
   return lastRate;
};

/**
 * Extract the description from lines preceding an HTS code line.
 * Skips C-codes (like C14000), "N" markers, and invoice headers.
 */
const extractDescription = (lines, htsLineIndex, htsCode) => {
   for (let i = htsLineIndex - 1; i >= Math.max(0, htsLineIndex - 4); i--) {
      const line = lines[i].trim();
      if (!line) continue;
      // Skip C-codes (classification codes like C14000, C7000)
      if (/^C\d{3,5}$/.test(line)) continue;
      // Skip "N" relationship indicator
      if (line === 'N') continue;
      // Skip invoice/bill header lines
      if (/^(Invoice|I\.T\.|MASTER|HOUSE|SUBHOUSE|BILL)/i.test(line)) continue;
      // Skip column headers
      if (/^(Dollars|Cents|DollarsCents)/.test(line)) continue;
      // Skip other HTS code lines
      if (HTS_LINE_REGEX.test(line)) break;

      // Remove leading line number (e.g., "001") from description
      let desc = line.replace(/^\d{3}/, '').trim();
      if (desc) return desc;
   }

   // Fallback to known description for IEEPA codes
   return IEEPA_CODE_DESCRIPTIONS[htsCode] || htsCode;
};

export {IEEPA_HTS_CODES, HTS_CODE_DESCRIPTIONS, IEEPA_HTS_PATTERN, IEEPA_CODE_DESCRIPTIONS};
