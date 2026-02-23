import pdf from 'pdf-parse';
import crypto from 'crypto';

const IEEPA_HTS_CODES = ['9903.01.20', '9903.01.24', '9903.01.25'];

const HTS_CODE_DESCRIPTIONS = {
   '9903.01.20': 'China/HK Fentanyl Emergency - 10% IEEPA Duty (Feb 4 - Mar 3, 2025)',
   '9903.01.24': 'China/HK Fentanyl Emergency - 20% IEEPA Duty (Mar 4, 2025+)',
   '9903.01.25': 'Reciprocal "Liberation Day" - 10% Baseline IEEPA Tariff (Apr 5, 2025+)'
};

export const parseEntrySummary = async (fileBuffer) => {
   const pdfData = await pdf(fileBuffer);
   const text = pdfData.text;

   const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

   const entryNumber = extractEntryNumber(text);
   const filerCode = extractFilerCode(text);
   const lineItems = extractTariffLineItems(text);

   const totalRefundAmount = lineItems.reduce((sum, item) => sum + item.dutyAmount, 0);
   const htsCodesFound = [...new Set(lineItems.map((item) => item.htsCode))];

   return {
      fileHash,
      entryNumber,
      filerCode,
      lineItems,
      totalRefundAmount,
      htsCodesFound,
      rawText: text,
      isEligible: lineItems.length > 0
   };
};

const extractEntryNumber = (text) => {
   const patterns = [
      /Entry\s*(?:No\.?|Number|#)\s*:?\s*(\d{3}[-\s]?\d{7}[-\s]?\d)/i,
      /(\d{3}[-\s]?\d{7}[-\s]?\d)/
   ];

   for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
         return match[1].replace(/[\s-]/g, '');
      }
   }
   return null;
};

const extractFilerCode = (text) => {
   const match = text.match(/Filer\s*(?:Code|ID)\s*:?\s*([A-Z0-9]{3,4})/i);
   return match ? match[1] : null;
};

const extractTariffLineItems = (text) => {
   const lineItems = [];

   for (const htsCode of IEEPA_HTS_CODES) {
      const escapedCode = htsCode.replace(/\./g, '\\.');
      const patterns = [
         new RegExp(
            escapedCode + '[\\s,]*\\$?([\\d,]+\\.?\\d{0,2})',
            'gi'
         ),
         new RegExp(
            escapedCode + '[\\s\\S]{0,100}?(?:duty|amount|rate)[\\s:]*\\$?([\\d,]+\\.?\\d{0,2})',
            'gi'
         ),
         new RegExp(
            '(?:duty|amount)[\\s:]*\\$?([\\d,]+\\.?\\d{0,2})[\\s\\S]{0,50}?' + escapedCode,
            'gi'
         )
      ];

      const foundAmounts = new Set();

      for (const pattern of patterns) {
         let match;
         while ((match = pattern.exec(text)) !== null) {
            const amountStr = match[1].replace(/,/g, '');
            const amount = parseFloat(amountStr);
            if (amount > 0 && !foundAmounts.has(amount)) {
               foundAmounts.add(amount);
               lineItems.push({
                  htsCode,
                  dutyAmount: amount,
                  description: HTS_CODE_DESCRIPTIONS[htsCode]
               });
            }
         }
      }

      if (foundAmounts.size === 0) {
         const codePresent = text.includes(htsCode);
         if (codePresent) {
            const nearbyText = extractNearbyText(text, htsCode);
            const amountMatch = nearbyText.match(/\$?([\d,]+\.?\d{0,2})/);
            if (amountMatch) {
               const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
               if (amount > 0) {
                  lineItems.push({
                     htsCode,
                     dutyAmount: amount,
                     description: HTS_CODE_DESCRIPTIONS[htsCode]
                  });
               }
            }
         }
      }
   }

   return lineItems;
};

const extractNearbyText = (text, searchTerm) => {
   const index = text.indexOf(searchTerm);
   if (index === -1) return '';
   const start = Math.max(0, index - 200);
   const end = Math.min(text.length, index + searchTerm.length + 200);
   return text.substring(start, end);
};

export { IEEPA_HTS_CODES, HTS_CODE_DESCRIPTIONS };
