'use strict';

const EndbSql = require('./sql');
const { safeRequire } = require('../util');
const { Pool } = safeRequire('pg');

class EndbPostgres extends EndbSql {
    constructor(options) {
        options = Object.assign({
            dialect: 'postgres',
            uri: 'postgresql://localhost:5432'
        }, options);
        options.connect = () => Promise.resolve()
            .then(() => {
                const pool = new Pool({
                    connectionString: options.uri
                });
                return sql => pool.query(sql)
                    .then(data => data.rows);
            });
        super(options);
    }
}

module.exports = EndbPostgres;