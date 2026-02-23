import Builder from 'json-sql';
import invariant from 'tiny-invariant';

const jsonSql = Builder({
   namedValues: false,
   valuesPrefix: '$$'
});
jsonSql.setDialect('mysql');

export function getSelectQuery(tableName, condition, options = {}) {
   const sql = jsonSql.build({
      type: 'select',
      table: tableName,
      condition,
      ...options
   });
   sql.query = sql.query.replace(/\$\$\d+/g, '?');
   return sql;
}

export function getInsertQuery(tableName, insertFields) {
   const sql = jsonSql.build({
      type: 'insert',
      table: tableName,
      values: insertFields
   });
   sql.query = sql.query.replace(/\$\$\d+/g, '?');
   return sql;
}

export function getUpdateQuery(tableName, updateFields, condition = {}) {
   invariant(
      updateFields && typeof updateFields === 'object' && !Array.isArray(updateFields),
      'updateFields must be a plain object'
   );

   const setClauses = [];
   const values = [];

   for (const [key, value] of Object.entries(updateFields)) {
      setClauses.push(`\`${key}\` = ?`);
      values.push(value);
   }

   const whereClauses = [];
   const conditionEntries = condition ? Object.entries(condition) : [];
   for (const [key, value] of conditionEntries) {
      whereClauses.push(`\`${key}\` = ?`);
      values.push(value);
   }

   const whereClause = whereClauses.length > 0 ? ` where ${whereClauses.join(' and ')}` : '';
   // prettier-ignore
   const query = `update \`${tableName}\`
                   set ${setClauses.join(', ')}${whereClause};`;

   return { query, values };
}

export function getInsertUpdateQuery(tableName, insertFields, updatePlus = {}, insertPlus = {}) {
   const insert = getInsertQuery(tableName, { ...insertFields, ...insertPlus });
   insert.query = insert.query.substring(0, insert.query.length - 1);
   insert.query += ' ON DUPLICATE KEY ';
   const update = getUpdateQuery(tableName, { ...insertFields, ...updatePlus });
   insert.query += update.query.replace(
      new RegExp('update\\s+`' + tableName + '`\\s+set\\s*', 'i'),
      'UPDATE '
   );
   insert.values = [...insert.values, ...update.values];
   return insert;
}

export function getDeleteQuery(tableName, condition, options = {}) {
   const sql = jsonSql.build({
      type: 'remove',
      table: tableName,
      condition,
      ...options
   });
   sql.query = sql.query.replace(/\$\$\d+/g, '?');
   return sql;
}
