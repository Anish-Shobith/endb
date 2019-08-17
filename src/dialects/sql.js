'use strict';

const EventEmitter = require('events');
const { safeRequire } = require('../util');
const { Sql } = safeRequire('sql');

class SqlDialect extends EventEmitter {
    constructor(options) {
        super();
        this.options = Object.assign({
            table: 'endb',
            keySize: 255
        }, options);
        console.log(this.options.table);
        const sql = new Sql(this.options.dialect);
        this.entry = sql.define({
            name: this.options.table,
            columns: [{
                    name: 'key',
                    primaryKey: true,
                    dataType: `VARCHAR(${Number(this.options.keySize)})`
                },
                {
                    name: 'value',
                    dataType: 'TEXT'
                }
            ]
        });
        const table = this.entry.create().ifNotExists().toString();
        const connection = options.connect().then(query => query(table).then(() => query));
        this.query = str => connection.then(query => query(str));
    }

    clear() {
        const del = this.entry.delete(this.entry.key.like(`${options.namespace}:%`)).toString();
        return this.query(del)
            .then(() => undefined);
    }

    delete(key) {
        const select = this.entry.select().where({ key }).toString();
        const del = this.entry.delete().where({ key }).toString();
        return this.query(select)
            .then(rows => {
                const row = rows[0];
                if (typeof row == 'undefined') return false;
                return this.query(del)
                    .then(() => true);
            });
    }

    get(key) {
        const select = this.entry.select().where({ key }).toString();
        return this.query(select)
            .then(rows => {
                const row = rows[0];
                if (typeof row == 'undefined') return undefined;
                return row.value;
            });
    }

    set(key, value) {
        let upsert;
        if (this.options.dialect == 'mysql') {
            value = value.replace(/\\/g, '\\\\');
        }
        if (this.options.dialect == 'postgres') {
            upsert = this.entry.insert({ key, value }).onConflict({ columns: ['key'], update: ['value'] }).toString();
        } else {
            upsert = this.entry.replace({ key, value }).toString();
        }
        return this.query(upsert);
    }
}

module.exports = SqlDialect;