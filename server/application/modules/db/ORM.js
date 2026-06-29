class ORM {
    constructor(db) {
        this.db = db;
    }

    _buildWhere(params = null, operand = 'AND') {
        if (!params || !Object.keys(params).length) return { clause: '', values: [] };
        const values = Object.values(params);
        const clause = ' WHERE ' + Object.keys(params).map(k => `${k} = ?`).join(` ${operand} `);
        return { clause, values };
    }

    _run(sql, values = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, values, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    _get(sql, values = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, values, (err, row) => {
                if (err) reject(err);
                else resolve(row ?? null);
            });
        });
    }

    _all(sql, values = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, values, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // SELECT одной записи
    // orm.get('users', { id: 1 })
    // orm.get('users', { role: 'admin' }, { columns: 'id, name', limit: 1, order: 'name ASC' })
    async get(table, params = null, options = {}) {
        const { columns = '*', operand = 'AND', order = null } = options;
        const { clause, values } = this._buildWhere(params, operand);
        const orderClause = order ? ` ORDER BY ${order}` : '';
        return await this._get(`SELECT ${columns} FROM ${table}${clause}${orderClause} LIMIT 1`, values);
    }

    // SELECT нескольких записей
    // orm.all('users', { role: 'admin' }, { order: 'name ASC', limit: 10 })
    async all(table, params = null, options = {}) {
        const { columns = '*', operand = 'AND', order = null, limit = null, offset = null } = options;
        const { clause, values } = this._buildWhere(params, operand);
        const orderClause = order ? ` ORDER BY ${order}` : '';
        const limitClause = limit != null ? ` LIMIT ${limit}` : '';
        const offsetClause = offset != null ? ` OFFSET ${offset}` : '';
        return await this._all(`SELECT ${columns} FROM ${table}${clause}${orderClause}${limitClause}${offsetClause}`, values);
    }

    // Количество записей
    // orm.count('users', { role: 'admin' })
    async count(table, params = null, operand = 'AND') {
        const { clause, values } = this._buildWhere(params, operand);
        const row = await this._get(`SELECT COUNT(*) as count FROM ${table}${clause}`, values);
        return row?.count ?? 0;
    }

    // INSERT - принимает объект
    // orm.insert('users', { name: 'Alice', role: 'admin' })
    async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        return await this._run(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`, values);
    }

    // UPDATE - оба аргумента объекты
    // orm.update('users', { role: 'moderator' }, { id: 1 })
    async update(table, data, params, operand = 'AND') {
        const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const setValues = Object.values(data);
        const { clause, values: whereValues } = this._buildWhere(params, operand);
        return await this._run(`UPDATE ${table} SET ${setClause}${clause}`, [...setValues, ...whereValues]);
    }

    // UPSERT (INSERT OR REPLACE)
    // orm.upsert('users', { id: 1, name: 'Alice', role: 'admin' })
    async upsert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        return await this._run(`INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`, values);
    }

    // DELETE
    // orm.delete('users', { id: 1 })
    async delete(table, params, operand = 'AND') {
        const { clause, values } = this._buildWhere(params, operand);
        return await this._run(`DELETE FROM ${table}${clause}`, values);
    }
}

module.exports = ORM;