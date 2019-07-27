'use strict';

const SQLite = require('better-sqlite3');
const { existsSync, mkdirSync } = require('fs');
const { resolve, sep } = require('path');
const { EndbError } = require('./EndbError');
const _init = Symbol('init');
const _setting = Symbol('setting');
const _check = Symbol('check');

/**
 * @class
 * @classdesc A simplified & powerful key-value database wrapper for ease-of-use
 */
class Database {

    /**
     * Initializes a new Database instance
     * @constructor
     * @param {Object} [options] Database options for the instance
     * @param {string} [options.name] The name of the database. Represents the table name in SQLite
     * @param {string} [options.fileName] The name of the database file
     * @param {string} [options.path] The path of the database file
     * @param {boolean} [options.fileMustExist] Whether or not, the database file must exist
     * @param {boolean} [options.timeout] The number of milliseconds to wait while executing queries on a locked database, before throwing a SQLITE_BUSY error
     * @param {number} [options.wal] The default method by which SQLite implements atomic commit and rollback is a rollback journal
     * @example
     * const Endb = require('endb');
     * const db = new Endb.Database({
     *   name: 'endb',
     *   fileName: 'endb',
     *   path: './',
     *   fileMustExist: false,
     *   timeout: 5000,
     *   wal: true
     * });
     */
    constructor(options = {}) {
        this[_setting]('name', 'String', true, 'endb', options.name.replace(/[^a-z0-9]/gi, '_').toLowerCase());
        this[_setting]('fileName', 'String', true, 'endb', options.fileName.replace(/[^a-zA-Z0-9]/g, ''));
        this[_setting]('path', 'String', true, resolve(process.cwd(), './'), resolve(process.cwd(), options.path));
        this[_setting]('fileMustExist', 'Boolean', true, false, options.fileMustExist);
        this[_setting]('timeout', 'Number', true, 5000, options.timeout);
        this[_setting]('wal', 'Boolean', true, true, options.wal);
        if (!existsSync(this.path)) mkdirSync(this.path);
        if (this.fileMustExist === true && !existsSync(this.fileName)) {
            throw new EndbError(`${this.fileName} does not exist in the directory`);
        }
        const db = new SQLite(`${this.path}${sep}${this.fileName}.db`, {
            fileMustExist: this.fileMustExist,
            timeout: this.timeout
        });
        this[_setting]('db', 'Database', true, db);
        this[_setting]('isDestroyed', 'Boolean', true, false);
        this[_setting]('onReady', 'Promise', true, new Promise((res) => this[_setting]('ready', 'Function', false, res)));
        this[_init](this.db);
    }

    /**
     * Gets the number of rows in the database
     * @returns {number} The number of rows in the database
     */
    get count() {
        const data = this.db.prepare(`SELECT count(*) FROM ${this.name};`).get();
        return data['count(*)'];
    }

    /**
     * Gets all the indexes (keys) from the database
     * @returns {string[]} The indexes (keys) from the database
     */
    get indexes() {
        const data = this.db.prepare(`SELECT key FROM ${this.name};`).all();
        return data.map(row => row.key);
    }

    /**
     * Deletes all the elements from the database
     * @returns {null}
     * @example
     * Database.clear();
     */
    clear() {
        this[_check]();
        return this.deleteAll();
    }

    /**
     * Shuts down the database
     * WARNING: USING THE METHOD MAKES THE DATABASE UNUSEABLE
     * @returns {Promise<*>}
     * @example
     * Database.close().then(console.log).catch(console.error);
     */
    close() {
        this[_check]();
        return this.db.close();
    }

    /**
     * Deletes a key of an element
     * @param {string|number} key The key of an element
     * @returns {boolean} Whether or not, the key has been deleted
     * @example
     * Database.delete('key');
     */
    delete(key) {
        this[_check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'EndbTypeError');
        }
        const data = this.db.prepare(`DELETE FROM ${this.name} WHERE key = ?;`).run(key);
        return typeof data != null ? true : false;
    }

    /**
     * Deletes all the elements from the database
     * @returns {null}
     * @example
     * Database.deleteAll();
     */
    deleteAll() {
        this[_check]();
        this.db.prepare(`DELETE FROM ${this.name};`).run();
        return null;
    }

    /**
     * Destroys the entire database and deletes the database elements
     * WARNING: THIS METHOD WILL DESTROY YOUR DATA AND CANNOT BE UNDONE
     * @returns {null}
     * @example
     * Database.destroy();
     */
    destroy() {
        this[_check]();
        this.deleteAll();
        this.isDestroyed = true;
        this.db.prepare(`DROP TABLE IF EXISTS ${this.name};`).run();
        return null;
    }

    /**
     * Exports the database to JSON
     * @returns {string} The data consisting of additional information and the elements
     * @example
     * Database.export();
     */
    export() {
        this[_check]();
        const data = this.getAll();
        return JSON.stringify({
            name: this.name,
            fileName: this.fileName,
            exportData: Date.now(),
            data
        }, null, 2);
    }


    /**
     * Finds a key matching the prefix supplied
     * @param {string|number} key The prefix term of a key to search for
     * @returns {Object}
     * @example
     * Database.find('key');
     */
    find(key) {
        this[_check]();
        if (prefix == null || !['String', 'Number'].includes(prefix.constructor.name)) {
            throw new EndbError('Prefix must be a string or number', 'EndbTypeError');
        }
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key LIKE ?;`).all([`${key}%`]);
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
     * const data = Database.get('key');
     * console.log(data);
     */
    get(key) {
        this[_check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'EndbTypeError');
        }
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`).get(key);
        try {
            data.value = JSON.parse(data.value);
        } catch {}
        return data.value;
    }

    /**
     * Gets all the element consisting of keys and elements from the database
     * @returns {object[]} An array object consisting of all the elements of the database.
     * Returns empty if the database is empty
     * @example
     * const data = Database.getAll();
     * console.log(data);
     */
    getAll() {
        this[_check]();
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key IS NOT NULL`).all();
        return data;
    }

    /**
     * Returns whether or not the specified key exists
     * @param {string|number} key The key of an element
     * @returns {boolean} Whether or not, the element with the key exists in the database
     * @example
     * Database.has('key');
     * if (Database.has('key')) {
     *  // ...
     * }
     */
    has(key) {
        this[_check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'EndbTypeError');
        }
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`).get(key);
        return data ? true : false;
    }

    /**
     * Initializes multiple database instances
     * @param {string[]} names The array of strings containing the separate names of each instance
     * @param {Object} [options] 
     */
    static multi(names, options = {}) {
        if (!names.length || names.length < 1) {
            throw new EndbError('Names must be an array of strings', 'EndbTypeError');
        }
        const obj = {};
        for (const name of names) {
            const db = new Database({ name, ...options });
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
     * Database.set('key', 'value');
     * Database.set('userExists', true);
     * Database.set('profile', {
     *   id: 1234567890,
     *   username: 'user',
     *   description: 'a user',
     *   verified: true
     * });
     * Database.set('keyArray', [ 'one', 'two', 3, 'four' ]);
     */
    set(key, value) {
        this[_check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'EndbKeyTypeError');
        }
        this.db.prepare(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?);`).run(key, JSON.stringify(value));
        return {
            key,
            value
        };
    }

    async [_init](db = this.db) {
        Object.defineProperty(this, 'db', {
            value: db,
            writable: false,
            enumerable: false,
            configurable: false
        });
        if (this.db) {
            Object.defineProperty(this, 'isReady', {
                value: true,
                writable: false,
                enumerable: false,
                configurable: false
            });
        } else {
            throw new EndbError('Database could not be loaded', 'EndbConnectionError');
        }
        const table = this.db.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?;`).get(this.name);
        if (!table['count(*)']) {
            this.db.prepare(`CREATE TABLE ${this.name} (key TEXT PRIMARY KEY, value TEXT);`).run();
            this.db.pragma('synchronous = 1');
            if (this.wal) this.db.pragma('journal_mode = wal');
        }
        this.ready();
        return this.onReady;
    }

    [_check]() {
        if (!this.isReady) throw new EndbError('Database is not ready. Refer to the documentation to use Database.onReady', 'EndbConnectionError');
        if (this.isDestroyed) throw new EndbError('Database has been destroyed', 'EndbConnectionError');
    }

    [_setting](name, type, writable, defaultValue, value) {
        if (value == null) value = defaultValue;
        if (value.constructor.name !== type) throw new EndbError(`Wrong value type provided`);
        Object.defineProperty(this, name, {
            value: value != null ? value : defaultValue,
            writable,
            enumerable: false,
            configurable: false
        });
    }
}

module.exports = Database;