'use strict';

const EventEmitter = require('events');
const { stringify, parse } = require('./util');

/**
 * @class
 * @classdesc
 * Simple key-value database with multi dialect support.
 */
class Endb extends EventEmitter {

    /**
     * @constructor
     * @param {string} [uri] The connection string URI. (Default: undefined)
     * @param {Object} [options] The options for the database. (Default: {})
     * @param {string} [options.namespace] The name of the database. (Default: endb)
     * @param {Function} [options.serialize] A custom serialization function.
     * @param {Function} [options.deserialize] A custom deserialization function.
     * @param {string} [options.dialect] The dialect to be used.
     * @param {string} [options.collection] The name of the collection. (MongoDB)
     * @param {string} [options.table] The name of the table. (SQL database)
     * @param {number} [options.keySize] The size of the key. (SQL database)
     * @example
     * const Endb = require('endb');
     * const db = new Endb();
     * const db = new Endb({
     *     namespace: 'endb',
     *     serialize: JSON.stringify,
     *     deserialize: JSON.parse
     * });
     */
    constructor(uri, options = {}) {
        super();
        this.options = Object.assign({
            namespace: 'endb',
            serialize: stringify,
            deserialize: parse
        }, (typeof uri === 'string') ? { uri } : uri, options);
        let Dialect;
        switch (this.getDialect()) {
            case 'mongodb':
                Dialect = require('./dialects/mongodb');
                break;
            case 'mongo':
                Dialect = require('./dialects/mongodb');
                break;
            case 'postgres':
                Dialect = require('./dialects/postgres');
                break;
            case 'postgresql':
                Dialect = require('./dialects/postgres');
                break;
            case 'redis':
                Dialect = require('./dialects/redis');
                break;
            case 'sqlite':
                Dialect = require('./dialects/sqlite');
                break;
            case 'sqlite3':
                Dialect = require('./dialects/sqlite');
                break;
            case 'mysql':
                Dialect = require('./dialects/mysql');
                break;
            default:
                Dialect = new Map();
                break;
        }
        if (Dialect instanceof Map) {
            this.dialect = Dialect;
        } else {
            this.dialect = new Dialect(this.options);
        }
        if (typeof this.dialect.on == 'function') this.dialect.on('error', err => this.emit('error', err));
        this.dialect.namespace = this.options.namespace;
    }

    /**
     * Deletes all the elements from the database
     * @returns {null}
     * @example
     * Endb.clear();
     */
    clear() {
        return Promise.resolve().then(() => this.dialect.clear());
    }

    /**
     * Deletes a key of an element
     * @param {string|number} key The key of an element
     * @returns {boolean} Whether or not, the key has been deleted
     * @example
     * Endb.delete('key');
     */
    delete(key) {
        key = this._prefixKey(key);
        return Promise.resolve().then(() => this.dialect.delete(key));
    }

    /**
     * Deletes all the elements from the database
     * @returns {Object}
     * @example
     * Endb.deleteAll();
     */
    deleteAll() {
        return this.clear();
    }

    /**
     * Gets the value of a specified key
     * @param {string|number} key The key of the element
     * @param {Object} [options={}] The options for the get
     * @returns {Promise<*>} The value of the key.
     * @example
     * Endb.get('key').then(console.log).catch(console.error);
     */
    get(key) {
        key = this._prefixKey(key);
        return Promise.resolve().then(() => this.dialect.get(key)).then(data => {
            data = typeof data == 'string' ? this.options.deserialize(data) : data;
            if (typeof data == 'undefined') return undefined;
            return data;
        });
    }

    /**
     * Gets the name of the dialect database is currently running
     * @returns {string} The name of the dialect
     */
    getDialect() {
        return this.options.dialect || /^[^:]*/.exec(this.options.uri)[0];
    }

    /**
     * Sets an element containing a key and a value
     * @param {string|number} key The key of the element
     * @param {*} value The value of the element
     * @returns {Promise<boolean>} An object containing the value
     * @example
     * Endb.set('key', 'value').then(console.log).catch(console.error);
     * Endb.set('userExists', true).then(console.log).catch(console.error);
     * Endb.set('profile', {
     *   id: 1234567890,
     *   username: 'user',
     *   description: 'A test user',
     *   verified: true
     * }).then(console.log).catch(console.error);
     */
    set(key, value) {
        key = this._prefixKey(key);
        return Promise.resolve().then(() => {
            return this.dialect.set(key, this.options.serialize(value));
        }).then(() => true);
    }

    _prefixKey(key) {
        return `${this.options.namespace}:${key}`;
    }
}

module.exports = Endb;