import {
   getDeleteQuery,
   getInsertQuery,
   getInsertUpdateQuery,
   getSelectQuery,
   getUpdateQuery
} from './query-builder.mjs';
import invariant from 'tiny-invariant';

export class MysqlTable {
   constructor(db, table) {
      this.TABLE = table;
      this.db = db;
   }

   async select(where, options = {}) {
      const query = getSelectQuery(this.TABLE, where, options);
      return await this.db.query(query.query, query.values);
   }

   async selectOne(where, options = {}) {
      const query = getSelectQuery(this.TABLE, where, { ...options, size: 1 });
      return (await this.db.query(query.query, query.values))[0];
   }

   async insertUpdate(data, updatePlus = {}, insertPlus = {}) {
      const query = getInsertUpdateQuery(this.TABLE, data, updatePlus, insertPlus);
      const res = await this.db.query(query.query, query.values);
      return { ...res, query: query.query, values: query.values };
   }

   async insert(data) {
      const query = getInsertQuery(this.TABLE, data);
      const res = await this.db.query(query.query, query.values);
      return { ...res, query: query.query, values: query.values };
   }

   async update(data, where) {
      invariant(where, 'where missing in update query');
      const query = getUpdateQuery(this.TABLE, data, where);
      const res = await this.db.query(query.query, query.values);
      return { ...res, query: query.query, values: query.values };
   }

   async deleteOne(where) {
      invariant(where, 'unable to delete everything');
      const query = getDeleteQuery(this.TABLE, where);
      const res = await this.db.query(query.query, query.values);
      return { ...res, query: query.query, values: query.values };
   }
}
