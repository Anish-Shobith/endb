'use strict';

const SQLite = require('better-sqlite3');
const { existsSync, mkdirSync } = require('fs');
const { resolve, sep } = require('path');
const { EndbError: Error } = require('./EndbError');
const { DataTypes, where, arrayify, mergeUpdate } = require('./Util');
const init = Symbol('init');
const check = Symbol('check');

class Model {
    constructor(schema, options = {}) {
        this.schema = schema;
        this.options = options;
        this.name = options.name;
        this.fileName = typeof options.fileName === 'string' ? options.fileName.replace(/[^a-z0-9]/gi, '_') : 'endb';
        this.path = typeof options.path === 'string' ? resolve(process.cwd(), options.path) : resolve(process.cwd(), './');
        this.fileMustExist = typeof options.fileMustExist === 'boolean' ? Boolean(options.fileMustExist) : false;
        this.timeout = typeof options.timeout === 'number' ? Number(options.timeout) : 5000;
        this.wal = typeof options.wal === 'boolean' ? Boolean(options.wal) : true;
        if (!existsSync(this.path)) mkdirSync(this.path);
        if (this.fileMustExist === true && !existsSync(this.fileName)) {
            throw new Error(`${this.fileName} does not exist in the directory`);
        }
        this._db = new SQLite(`${this.path}${sep}${this.fileName}.db`, {
            fileMustExist: this.fileMustExist,
            timeout: this.timeout
        });
        this.isDestroyed = false;
        this.onReady = new Promise(res => this.ready = res);
        this[init](this._db);
    }

    /**
     * Gets the number of rows in the database
     * @returns {number} The number of rows in the database
     */
    get count() {
        const data = this._db.prepare(`SELECT count(*) FROM ${this.name};`).get();
        return data['count(*)'];
    }

    /**
     * Shuts down the database connection
     * WARNING: USING THE METHOD MAKES THE DATABASE UNWORKABLE
     * @returns {undefined}
     * @example
     * Model.close().then(console.log).catch(console.error);
     */
    close() {
        this[check]();
        this._db.close();
        return undefined;
    }

    delete(conditions = {}) {
        this[check]();
        const stmt = this._db.prepare(`DELETE FROM \`${this.name}\` ${where(conditions)}`);
        return conditions ? stmt.run(conditions) : stmt.run();
    }

    deleteModel() {
        this._db.prepare(`DROP TABLE \`${this.name}\``);
        return undefined;
    }

    deleteAll() {
        this[check]();
        this._db.prepare(`DELETE FROM ${this.name};`).run();
        return undefined;
    }

    find(filter = {}) {
        this[check]();
        const columns = arrayify(Object.keys(this.schema)).sort();
        const stmt = this._db.prepare(`SELECT ${columns.join(', ')} FROM ${this.name} ${where(filter)};`);
        return filter ? stmt.all(filter) : stmt.all();
    }

    insert(doc = {}) {
        this[check]();
        const columns = Object.keys(this.schema);
        const names = columns.join(', ');
        const values = columns.map(col => `@${col}`).join(', ');
        this._db.prepare(`INSERT INTO \`${this.name}\` (${names}) VALUES (${values});`).run(doc);
        return doc;
    }

    update(filter, clause) {
        this[check]();
        const values = Object.keys(filter).map(k => (`${k} = @value_${k}`)).join(', ');
        this._db.prepare(`UPDATE OR REPLACE \`${this.name}\` SET ${values} ${where(clause, 'clause_')}`).run(mergeUpdate(filter, clause));
        return { filter, clause };
    }

    async [init](db = this._db) {
        if (db) {
            this.isReady = true;
        } else {
            throw new Error('Database could not be loaded', 'EndbConnectionError');
        }
        const table = db.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?;`).get(this.name);
        if (!table['count(*)']) {
            db.prepare(`CREATE TABLE IF NOT EXISTS \`${this.name}\` (${this.options.columns});`).run();
            db.pragma('synchronous = 1');
            if (this.wal) db.pragma('journal_mode = wal');
        }
        this.ready();
        return this.onReady;
    }

    [check]() {
        if (!this.isReady) throw new Error('Database is not ready. Refer to the documentation to use Endb.onReady', 'EndbConnectionError');
        if (this.isDestroyed) throw new Error('Database has been destroyed', 'EndbConnectionError');
    }
}

module.exports.Model = Model;
module.exports.Error = Error;
module.exports.Types = DataTypes;