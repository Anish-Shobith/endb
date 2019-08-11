'use strict';

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const check = Symbol('check');
const init = Symbol('init');
const Util = require('./Util');

/**
 * @class Model
 * @classdesc
 * Represents a table in the database
 */
class Model {
    constructor(schema, options = {}) {
        this.schema = schema;
        this.options = options;
        this.fileName = options.fileName ? options.fileName.replace(/[^a-z0-9]/gi, '_') : 'endb';
        this.path = options.path ? path.resolve(process.cwd(), options.path) : path.resolve(process.cwd(), './');
        this.fileMustExist = options.fileMustExist ? Boolean(options.fileMustExist) : false;
        this.timeout = options.timeout ? Number(options.timeout) : 5000;
        this.wal = options.wal ? Boolean(options.wal) : true;
        // this.memory = options.memory ? Boolean(options.memory) : false;
        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
        if (this.fileMustExist === true && !existsSync(this.fileName)) {
            throw new Error(`${this.fileName} does not exist in the directory`);
        }
        this._db = new Database(`${this.path}${path.sep}${this.fileName}.db`, {
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
        this[check]();
        const data = this._db.prepare(`SELECT count(*) FROM \`${this.name}\`;`).get();
        return data['count(*)'];
    }

    /**
     * Backups the model of the database
     * @method Model#backup
     * @param {string} path The path for the backup file
     * @param {*} [options] The options for the backup
     */
    backup(path, options) {
        this[check]();
        return this._db.backup(path.resolve(path), options);
    }

    /**
     * Closes the database connection
     * @method Model#close
     * @returns {undefined}
     * @example
     * Model.close();
     */
    close() {
        this[check]();
        this._db.close();
        return undefined;
    }

    /**
     * Deletes the document that matches conditions from the model
     * @method Model#delete
     * @param {Object} [criteria] Criteria for delete
     * @returns {Object}
     * @example
     * Model.delete({ id: 123456789 });
     */
    delete(criteria = {}) {
        this[check]();
        const query = [
            `DELETE FROM \`${this.name}\``,
            Util.where(criteria)
        ].filter(array => !!array).join(' ');
        const stmt = this._db.prepare(query);
        return criteria ? stmt.run(criteria) : stmt.run();
    }

    /**
     * Deletes the model from the database
     * @method Model#deleteModel
     * @returns {void}
     */
    deleteModel() {
        this[check]();
        delete this.endb.models[this.name];
        this._db.prepare(`DROP TABLE \`${this.name}\`;`).run();
        return undefined;
    }

    /**
     * Deletes all documents from the model
     * @method Model#deleteAll
     * @returns {Object}
     */
    deleteAll() {
        this[check]();
        return this._db.prepare(`DELETE FROM \`${this.name}\`;`).run();
    }

    /**
     * Whether or not, the document exists or not in the model
     * @method Model#has
     * @param {Object} criteria Criteria to fetch the doc
     * @returns {boolean}
     * @example
     * const has = Model.has({ id: 123456789 });
     * console.log(has);
     */
    has(criteria) {
        this[check]();
        const columns = Util.arrayify(Object.keys(this.schema)).sort();
        const query = [
            `SELECT ${columns.join(', ')} FROM \`${this.name}\``,
            Util.where(criteria)
        ].filter(array => !!array).join(' ');
        const stmt = this._db.prepare(query).get(criteria);
        return stmt ? true : false;
    }

    /**
     * Finds a document taking filter into account
     * @method Model#find
     * @param {Object} [criteria] Criteria to fetch the doc. If criteria object is not supplied, all documents are returned
     * @returns {any[]}
     */
    find(criteria = {}) {
        this[check]();
        const columns = Util.arrayify(Object.keys(this.schema)).sort();
        const query = [
            `SELECT ${columns.join(', ')} FROM \`${this.name}\``,
            Util.where(criteria),
            Util.order(criteria),
            Util.limit(criteria)
        ].filter(array => !!array).join(' ');
        const stmt = this._db.prepare(query);
        return criteria ? stmt.all(criteria) : stmt.all();
    }

    /**
     * Inserts a document to the model
     * @method Model#insert
     * @param {Object} doc The document to insert to the model
     * @returns {Object}
     * @example
     * Model.insert({
     *     id: 123456789,
     *     username: 'username',
     *     verified: true
     * });
     */
    insert(doc) {
        this[check]();
        const columns = Object.keys(this.schema);
        const names = columns.join(', ');
        const values = columns.map(col => `@${col}`).join(', ');
        this._db.prepare(`INSERT INTO \`${this.name}\` (${names}) VALUES (${values});`).run(doc);
        return doc;
    }

    /**
     * Loads a compiled SQLite3 extension and applies it to the current database connection
     * @method Model#loadExtension
     * @param {string} path
     * @returns {void}
     */
    loadExtension(path) {
        this._db.loadExtension(path.resolve(process.cwd(), path));
        return undefined;
    }

    /**
     * Updates a document values by finding the values
     * @method Model#update
     * @param {Object} [criteria] Value(s) of document to find
     * @param {Object} clause The update
     * @returns {Object}
     * @example
     * Model.update({ id: 1234567890 }, { username: 'newuser' });
     */
    update(criteria, clause) {
        this[check]();
        const values = Object.keys(criteria).map(k => (`${k} = @value_${k}`)).join(', ');
        const query = [
            `UPDATE OR REPLACE \`${this.name}\` SET ${values}`,
            Util.where(clause, 'clause_')
        ].filter(array => !!array).join(' ');
        this._db.prepare(query).run(Util.mergeUpdate(criteria, clause));
        return {
            ...clause
        };
    }

    async [init](db = this._db) {
        if (db) {
            this.isReady = true;
        } else {
            throw new Error('Database could not be loaded');
        }
        const table = db.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?;`).get(this.name);
        if (!table['count(*)']) {
            db.prepare(`CREATE TABLE IF NOT EXISTS \`${this.name}\` (${this.columns});`).run();
            if (this.wal) {
                db.pragma('journal_mode = wal');
            }
        }
        this.ready();
        return this.onReady;
    }

    [check]() {
        if (!this.isReady) throw new Error('Database connection is not ready');
        if (this.isDestroyed) throw new Error('Database connection is destroyed and is inaccesible');
    }
}

module.exports = Model;
module.exports.Types = Util.DataTypes;