import invariant from 'tiny-invariant';
import { MysqlConnector } from './mysql-connector.mjs';

let dbInstance = null;

export const getDB = () => {
   if (dbInstance) {
      return dbInstance;
   }

   const host = process.env.SKAR_SERVER_ONE_DB_HOST;
   invariant(host, 'SKAR_SERVER_ONE_DB_HOST is not defined');

   dbInstance = new MysqlConnector({
      host,
      user: process.env.SKAR_SERVER_ONE_DB_USER,
      password: process.env.SKAR_SERVER_ONE_DB_PW,
      database: 'tariff_refund_helper_site',
      port: process.env.SKAR_SERVER_ONE_DB_PORT
   });

   return dbInstance;
};

export const getEntrySummariesTable = () => getDB().getTable('entry_summaries');
export const getTariffLineItemsTable = () => getDB().getTable('tariff_line_items');
export const getSiteStatsTable = () => getDB().getTable('site_stats');
