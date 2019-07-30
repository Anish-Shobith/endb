'use strict';

const SQLite = require('better-sqlite3');
const { existsSync, mkdirSync } = require('fs');
const { resolve, sep } = require('path');
const { Options, mergeDefault, validateOptions } = require('./Util');
const { EndbError } = require('./EndbError');
const { version } = require('../package');
const init = Symbol('init');
const check = Symbol('check');

/**
 * A simplified & powerful key-value database wrapper for ease-of-use
 */
class Endb {

    /**
     * Initializes a new Endb instance
     * @constructor
     * @param {Options} [options] Endb options for the instance
     * @param {string} [options.name] The name of the database. Represents the table name in SQLite
     * @param {string} [options.fileName] The name of the database file
     * @param {string} [options.path] The path of the database file
     * @param {boolean} [options.fileMustExist] Whether or not, the database file must exist
     * @param {boolean} [options.timeout] The number of milliseconds to wait while executing queries on a locked database, before throwing a SQLITE_BUSY error
     * @param {number} [options.wal] The default method by which SQLite implements atomic commit and rollback is a rollback journal
     * @example
     * const Endb = require('endb');
     * const db = new Endb({
     *   name: 'endb',
     *   fileName: 'endb',
     *   path: './',
     *   fileMustExist: false,
     *   timeout: 5000,
     *   wal: true
     * });
     */
    constructor(options = {}) {
        this.options = mergeDefault(Options, options);
        validateOptions(options);
        this.name = this.options.name ? options.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'endb';
        this.fileName = this.options.fileName ? options.fileName.replace(/[^a-z0-9]/gi, '_') : 'endb';
        this.path = this.options.path ? resolve(process.cwd(), this.options.path) : resolve(process.cwd(), './');
        this.fileMustExist = this.options.fileMustExist ? Boolean(options.fileMustExist) : false;
        this.timeout = this.options.timeout ? Number(options.timeout) : 5000;
        this.wal = this.options.wal ? Boolean(options.wal) : true;
        if (!existsSync(this.path)) mkdirSync(this.path);
        if (this.fileMustExist === true && !existsSync(this.fileName)) {
            throw new EndbError(`${this.fileName} does not exist in the directory`);
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
     * Gets the filename of the database
     * @returns {string}
     */
    get fileName() {
        return this.fileName;
    }

    /**
     * Gets all the indexes (keys) from the database
     * @returns {string[]} The indexes (keys) from the database
     */
    get indexes() {
        const data = this._db.prepare(`SELECT key FROM ${this.name};`).all();
        return data.map(row => row.key);
    }

    /**
     * Gets the name of the table
     * @returns {string}
     */
    get name() {
        return this.name;
    }

    /**
     * Gets the path of the database file
     * @returns {string}
     */
    get path() {
        return this.path;
    }

    /**
     * Deletes all the elements from the database
     * @returns {null}
     * @example
     * Endb.clear();
     */
    clear() {
        this[check]();
        return this.deleteAll();
    }

    /**
     * Shuts down the database
     * WARNING: USING THE METHOD MAKES THE DATABASE UNWORKABLE
     * @returns {Promise<*>}
     * @example
     * Endb.close().then(console.log).catch(console.error);
     */
    close() {
        this[check]();
        return this._db.close();
    }

    /**
     * Deletes a key of an element
     * @param {string|number} key The key of an element
     * @returns {boolean} Whether or not, the key has been deleted
     * @example
     * Endb.delete('key');
     */
    delete(key) {
        this[check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'ENDB_TYPE_ERROR');
        }
        const data = this._db.prepare(`DELETE FROM ${this.name} WHERE key = ?;`).run(key);
        return typeof data != null ? true : false;
    }

    /**
     * Deletes all the elements from the database
     * @returns {null}
     * @example
     * Endb.deleteAll();
     */
    deleteAll() {
        this[check]();
        this._db.prepare(`DELETE FROM ${this.name};`).run();
        return null;
    }

    /**
     * Destroys the entire database and deletes the database elements
     * WARNING: THIS METHOD WILL DESTROY YOUR DATA AND CANNOT BE UNDONE
     * @returns {null}
     * @example
     * Endb.destroy();
     */
    destroy() {
        this[check]();
        this.deleteAll();
        this.isDestroyed = true;
        this._db.prepare(`DROP TABLE IF EXISTS ${this.name};`).run();
        return null;
    }

    /**
     * Exports the database to a JSON
     * @param {object} [options]
     * @returns {string} The data consisting of additional information and the elements
     * @example
     * Endb.export();
     */
    export(options = {}) {
        options.options = {};
        this[check]();
        const data = this.getAll();
        return JSON.stringify({
            ...this.options,
            version,
            date: Date.now(),
            data
        }, null, 2);
    }

    /**
     * Finds a key matching the prefix supplied
     * @param {string|number} key The prefix term of a key to search for
     * @returns {Object}
     * @example
     * Endb.find('key');
     */
    find(key) {
        this[check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Prefix must be a string or number', 'ENDB_TYPE_ERROR');
        }
        const data = this._db.prepare(`SELECT * FROM ${this.name} WHERE key LIKE ?;`).all([`${key}%`]);
        var row = {};
        for (let i in data) {
            row[i] = JSON.parse(data[i].value);
        }
        return row;
    }

    /**
     * Gets a value of a specified key
     * @param {string|number} key The key of the element
     * @returns {*} The value of the key.
     * @example
     * const data = Endb.get('key');
     * console.log(data);
     */
    get(key) {
        this[check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'ENDB_TYPE_ERROR');
        }
        const data = this._db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`).get(key);
        try {
            data.value = JSON.parse(data.value);
        } catch {}
        return data.value;
    }

    /**
     * Gets all the element consisting of keys and elements from the database
     * @returns {any[]} An array object consisting of all the elements of the database.
     * Returns empty if the database is empty
     * @example
     * const data = Endb.getAll();
     * console.log(data);
     */
    getAll() {
        this[check]();
        const data = this._db.prepare(`SELECT * FROM ${this.name} WHERE key IS NOT NULL`).all();
        return data;
    }

    /**
     * Returns whether or not the specified key exists
     * @param {string|number} key The key of an element
     * @returns {boolean} Whether or not, the element with the key exists in the database
     * @example
     * Endb.has('key');
     * const data = Endb.has('profile');
     * if (data) {
     *   return console.log('Profile exists');
     * }
     */
    has(key) {
        this[check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'ENDB_TYPE_ERROR');
        }
        const data = this._db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`).get(key);
        return data ? true : false;
    }

    /**
     * Initializes multiple database instances
     * @param {string[]} names The array of strings containing the separate names of each instance
     * @param {Object} [options]
     * @returns {Endb[]} An array of initialized database
     */
    static multi(names, options = {}) {
        if (!names.length || names.length < 1) {
            throw new EndbError('Names must be an array of strings', 'ENDB_TYPE_ERROR');
        }
        const obj = {};
        for (const name of names) {
            const db = new Endb({ name, ...options });
            obj[name] = db;
        }
        return obj;
    }

    /**
     * Sets an element containing a key and a value
     * @param {string|number} key The key of the element
     * @param {*} value The value of the element
     * @returns {Object} An object containing the key and the value
     * @example
     * Endb.set('key', 'value');
     * Endb.set('userExists', true);
     * Endb.set('profile', {
     *   id: 1234567890,
     *   username: 'user',
     *   description: 'A test user',
     *   verified: true
     * });
     * Endb.set('numbers', [ 'one', 'two', 3, 'four' ]);
     */
    set(key, value) {
        this[check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'ENDB_TYPE_ERROR');
        }
        this._db.prepare(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?);`).run(key, JSON.stringify(value));
        return { key, value };
    }

    async [init](db = this._db) {
        if (db) {
            this.isReady = true;
        } else {
            throw new EndbError('Database could not be loaded', 'ENDB_CONNECTION_ERROR');
        }
        const table = db.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?;`).get(this.name);
        if (!table['count(*)']) {
            db.prepare(`CREATE TABLE ${this.name} (key TEXT PRIMARY KEY, value TEXT);`).run();
            db.pragma('synchronous = 1');
            if (this.wal) db.pragma('journal_mode = wal');
        }
        this.ready();
        return this.onReady;
    }

    [check]() {
        if (!this.isReady) throw new EndbError('Database is not ready. Refer to the documentation to use Endb.onReady', 'EndbConnectionError');
        if (this.isDestroyed) throw new EndbError('Database has been destroyed', 'EndbConnectionError');
    }
}

module.exports = Endb;