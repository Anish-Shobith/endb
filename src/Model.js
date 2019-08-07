'use strict';

const SQLite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const Error = require('./EndbError');
const Util = require('./Util');
const init = Symbol('init');
const check = Symbol('check');

/**
 * Represents a table in the database
 */
class Model {
    constructor(schema, options = {}) {
        this.schema = schema;
        this.options = options;
        this.name = options.name;
        this.fileName = options.fileName.replace(/[^a-z0-9]/gi, '_') || 'endb';
        this.path = path.resolve(process.cwd(), options.path) || path.resolve(process.cwd(), './');
        this.fileMustExist = Boolean(options.fileMustExist) || false;
        this.timeout = Number(options.timeout) || 5000;
        this.wal = Boolean(options.wal) || true;
        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
        if (this.fileMustExist === true && !existsSync(this.fileName)) {
            throw new Error(`${this.fileName} does not exist in the directory`);
        }
        this._db = new SQLite(`${this.path}${path.sep}${this.fileName}${Util.extension}`, {
            fileMustExist: this.fileMustExist,
            timeout: this.timeout
        });
        this.isDestroyed = false;
        this.onReady = new Promise(res => this.ready = res);
        this[init](this._db);
    }

    /**
     * Gets the number of documents in the database
     * @returns {number} The number of rows in the database
     */
    get count() {
        const data = this._db.prepare(`SELECT count(*) FROM ${this.name};`).get();
        return data['count(*)'];
    }

    /**
     * Closes the database connection
     * @method Model#close
     * @returns {undefined}
     * @example
     * Model.close().then(console.log).catch(console.error);
     */
    close() {
        this[check]();
        this._db.close();
        return undefined;
    }

    /**
     * Deletes the document that matches conditions from the model
     * @method Model#delete
     * @param {Object} [conditions] Filter the delete
     * @returns {Model}
     */
    delete(conditions = {}) {
        this[check]();
        const query = [
            `DELETE FROM \`${this.name}\``,
            Util.where(conditions)
        ].filter(array => !!array).join(' ');
        const stmt = this._db.prepare(query);
        if (conditions) {
            stmt.run(conditions);
        } else {
            stmt.run();
        }
        return this;
    }

    /**
     * Deletes the model from the database
     * @method Model#deleteModel
     * @returns {void}
     */
    deleteModel() {
        delete this.options.endb.models[this.name];
        this._db.prepare(`DROP TABLE \`${this.name}\`;`).run();
        return undefined;
    }

    /**
     * Deletes all documents from the model
     * @method Model#deleteAll
     * @returns {Model}
     */
    deleteAll() {
        this[check]();
        this._db.prepare(`DELETE FROM \`${this.name}\`;`).run();
        return this;
    }

    /**
     * Finds a document taking filter into account
     * @method Model#find
     * @param {Object} [where] Value(s) of document to find. If where object is not supplied, all documents are returned
     * @returns {any[]}
     */
    find(where = {}) {
        this[check]();
        const columns = Util.arrayify(Object.keys(this.schema)).sort();
        const query = [
            `SELECT ${columns.join(', ')} FROM ${this.name}`,
            Util.where(where),
            Util.order(where),
            Util.limit(where)
        ].filter(array => !!array).join(' ');
        const stmt = this._db.prepare(query);
        return filter ? stmt.all(where) : stmt.all();
    }

    /**
     * Inserts a document to the model
     * @method Model#insert
     * @param {Object} doc The document to insert to the model
     * @returns {Object}
     */
    insert(doc = {}) {
        this[check]();
        const columns = Object.keys(this.schema);
        const names = columns.join(', ');
        const values = columns.map(col => `@${col}`).join(', ');
        this._db.prepare(`INSERT INTO ${this.name} (${names}) VALUES(${values});`).run(doc);
        return doc;
    }

    /**
     * Loads a compiled SQLite3 extension and applies it to the current database connection
     * @method Model#loadExtension
     * @param {string} path
     */
    loadExtension(path) {
        return this._db.loadExtension(path.resolve(process.cwd(), path));
    }

    /**
     * Updates a document values by finding the values
     * @method Model#update
     * @param {Object} [where] Value(s) of document to find
     * @param {*} clause The update
     * @returns {Object}
     */
    update(filter, clause) {
        this[check]();
        const values = Object.keys(filter).map(k => (`${k} = @value_${k}`)).join(', ');
        this._db.prepare(`UPDATE OR REPLACE ${this.name} SET ${values} ${Util.where(clause, 'clause_')}`).run(Util.mergeUpdate(filter, clause));
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

module.exports = Model;
module.exports.Error = Error;
module.exports.Util = Util;
module.exports.Types = Util.DataTypes;