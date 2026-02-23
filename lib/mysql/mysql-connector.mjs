import mysql from 'mysql2/promise.js';
import { MysqlTable } from './mysql-table.mjs';

const pools = {};

export class MysqlConnector {
   config;
   connection;
   databaseName;
   alive = true;
   closed = false;
   tableName;

   constructor(config) {
      this.config = {
         ...config,
         timezone: 'Z',
         waitForConnections: true,
         connectionLimit: 10,
         queueLimit: 0,
         enableKeepAlive: true,
         keepAliveInitialDelay: 0
      };
      this.databaseName = config.database;
      this.connection = mysql.createPool(this.config);
      pools[this.databaseName] = this.connection;

      this.connection.on('error', (err) => {
         console.error(
            `[MYSQL][Error] Error in database [${this.databaseName}]:`,
            err?.message
         );
         this.alive = false;
      });
   }

   getTable(tableName) {
      this.tableName = tableName;
      return new MysqlTable(this, tableName);
   }

   query = async (sql, args) => {
      let attempt = 0;
      const maxRetries = 3;
      const retryDelay = 250;
      const retryableErrors = [
         'ECONNRESET',
         'ENOBUFS',
         'PROTOCOL_CONNECTION_LOST',
         'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
         'ER_LOCK_DEADLOCK',
         'Pool is closed'
      ];

      while (attempt < maxRetries) {
         try {
            const [rows] = await this.connection.query(sql, args);
            return rows;
         } catch (error) {
            const now = new Date().toISOString();
            if (!error?.message?.toLowerCase()?.includes('duplicate')) {
               console.error(
                  `[${now}] [MYSQL ERROR] [DB: ${this.databaseName || 'unknown'} | Table: ${this.tableName || 'unknown'} (attempt ${attempt + 1})] Code: ${error?.code || 'N/A'} | SQL: ${sql}`,
                  error?.message
               );
            }

            const isRetryableError = retryableErrors?.includes(error?.code);
            if (isRetryableError) {
               attempt++;
               if (attempt === 1) {
                  console.warn(`[${now}] [MYSQL POOL RESET] Recreating pool for "${this.databaseName}"`);
                  delete pools[this.databaseName];
                  this.connection = mysql.createPool(this.config);
                  pools[this.databaseName] = this.connection;
               }

               if (attempt < maxRetries) {
                  await new Promise((resolve) => setTimeout(resolve, retryDelay));
                  continue;
               }
            }
            throw error;
         }
      }
   };

   async getTableFields(tableName) {
      try {
         return await this.query('DESCRIBE ' + tableName);
      } catch (e) {
         console.error('getTableFields error:', e?.message);
      }
   }

   async transaction(callback) {
      let connection;
      try {
         connection = await this.connection.getConnection();
         await connection.beginTransaction();
         const result = await callback(connection);
         await connection.commit();
         return result;
      } catch (error) {
         if (connection) {
            try {
               await connection.rollback();
            } catch (rollbackError) {
               console.error('[MySQL] Error during transaction rollback:', rollbackError);
            }
         }
         throw error;
      } finally {
         if (connection) {
            connection.release();
         }
      }
   }

   async close() {
      this.alive = false;
      this.closed = true;
      await this.connection.end();
   }
}
