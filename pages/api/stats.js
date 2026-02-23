import { getSiteStatsTable } from '@/lib/mysql/db.mjs';

export default async function handler(req, res) {
   if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
   }

   try {
      const stats = await getSiteStatsTable().select({});

      const statsMap = {};
      for (const row of stats) {
         statsMap[row.stat_key] = parseFloat(row.stat_value);
      }

      return res.status(200).json({
         totalEntriesProcessed: statsMap['total_entries_processed'] || 0,
         totalRefundAmount: statsMap['total_refund_amount'] || 0,
         eligibleEntries: statsMap['eligible_entries'] || 0,
         lastUpdated: new Date().toISOString()
      });
   } catch (error) {
      console.error('[API] Stats error:', error?.message);
      return res.status(500).json({ error: 'Failed to fetch stats' });
   }
}
