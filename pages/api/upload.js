import formidable from 'formidable';
import fs from 'fs';
import {parseEntrySummary} from '@/lib/pdf/parse-entry-summary.mjs';
import {getDB, getEntrySummariesTable, getTariffLineItemsTable} from '@/lib/mysql/db.mjs';

export const config = {
   api: {
      bodyParser: false
   }
};

export default async function handler(req, res) {
   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
   }

   try {
      const { files } = await parseForm(req);
      const file = files.file?.[0];

      if (!file) {
         return res.status(400).json({ error: 'No file uploaded' });
      }

      if (file.mimetype !== 'application/pdf') {
         return res.status(400).json({ error: 'Only PDF files are accepted' });
      }

      if (file.size > 10 * 1024 * 1024) {
         return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      const results = await parseEntrySummary(fileBuffer);

      const existingEntry = await getEntrySummariesTable().selectOne({
         upload_hash: results.fileHash
      });

      if (existingEntry) {
         const lineItems = await getTariffLineItemsTable().select({
            entry_summary_id: existingEntry.id
         });

         return res.status(200).json({
            status: 200,
            duplicate: true,
            result: {
               id: existingEntry.id,
               entryNumber: existingEntry.entry_number,
                entryDate: existingEntry.entry_date || null,
                countryOfOrigin: existingEntry.country_of_origin || null,
                totalEnteredValue: existingEntry.total_entered_value
                    ? parseFloat(existingEntry.total_entered_value)
                    : null,
               isEligible: existingEntry.status === 'eligible',
               totalRefundAmount: parseFloat(existingEntry.total_refund_amount),
               htsCodesFound: safeJsonParse(existingEntry.hts_codes_found, []),
               lineItems: lineItems.map((item) => ({
                  htsCode: item.hts_code,
                  dutyAmount: parseFloat(item.duty_amount),
                   rate: item.rate || null,
                  description: item.description
               }))
            }
         });
      }

      const ip =
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.socket?.remoteAddress ||
         'unknown';

      const entryResult = await getEntrySummariesTable().insert({
         entry_number: results.entryNumber,
         filer_code: results.filerCode,
         upload_hash: results.fileHash,
         ip_address: ip,
         total_refund_amount: results.totalRefundAmount,
         hts_codes_found: JSON.stringify(results.htsCodesFound),
         status: results.isEligible ? 'eligible' : 'not_eligible',
         raw_extracted_text: results.rawText?.substring(0, 50000)
      });

      const entryId = entryResult.insertId;

      if (results.lineItems.length > 0) {
         for (const item of results.lineItems) {
            await getTariffLineItemsTable().insert({
               entry_summary_id: entryId,
               hts_code: item.htsCode,
               duty_amount: item.dutyAmount,
               description: item.description
            });
         }
      }

      await updateSiteStats(results);

      fs.unlinkSync(file.filepath);

      return res.status(200).json({
         status: 200,
         result: {
            id: entryId,
            entryNumber: results.entryNumber,
             entryDate: results.entryDate,
             countryOfOrigin: results.countryOfOrigin,
             totalEnteredValue: results.totalEnteredValue,
            isEligible: results.isEligible,
            totalRefundAmount: results.totalRefundAmount,
            htsCodesFound: results.htsCodesFound,
            lineItems: results.lineItems
         }
      });
   } catch (error) {
      console.error('[API] Upload error:', error);
      return res.status(500).json({
         error: 'Failed to process the PDF. Please ensure it is a valid customs entry summary.'
      });
   }
}

const parseForm = (req) => {
   return new Promise((resolve, reject) => {
      const form = formidable({
         maxFileSize: 10 * 1024 * 1024
      });
      form.parse(req, (err, fields, files) => {
         if (err) reject(err);
         else resolve({ fields, files });
      });
   });
};

const safeJsonParse = (str, fallback) => {
   try {
      return JSON.parse(str) ?? fallback;
   } catch {
      return fallback;
   }
};

const updateSiteStats = async (results) => {
   try {
      const db = getDB();

      await db.query(
         `UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_key = 'total_entries_processed'`
      );

      if (results.isEligible) {
         await db.query(
            `UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_key = 'eligible_entries'`
         );
         await db.query(
            `UPDATE site_stats SET stat_value = stat_value + ? WHERE stat_key = 'total_refund_amount'`,
            [results.totalRefundAmount]
         );
      }
   } catch (error) {
      console.error('[Stats Update Error]:', error?.message);
   }
};
