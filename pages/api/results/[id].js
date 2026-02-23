import { getEntrySummariesTable, getTariffLineItemsTable } from '@/lib/mysql/db.mjs';

export default async function handler(req, res) {
   if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
   }

   const { id } = req.query;

   if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid entry ID' });
   }

   try {
      const entry = await getEntrySummariesTable().selectOne({ id: parseInt(id) });

      if (!entry) {
         return res.status(404).json({ error: 'Entry not found' });
      }

      const lineItems = await getTariffLineItemsTable().select({
         entry_summary_id: entry.id
      });

      return res.status(200).json({
         id: entry.id,
         entryNumber: entry.entry_number,
         filerCode: entry.filer_code,
         isEligible: entry.status === 'eligible',
         totalRefundAmount: parseFloat(entry.total_refund_amount),
         htsCodesFound: JSON.parse(entry.hts_codes_found || '[]'),
         uploadedAt: entry.uploaded_at,
         lineItems: lineItems.map((item) => ({
            htsCode: item.hts_code,
            dutyAmount: parseFloat(item.duty_amount),
            description: item.description
         }))
      });
   } catch (error) {
      console.error('[API] Results error:', error?.message);
      return res.status(500).json({ error: 'Failed to fetch results' });
   }
}
