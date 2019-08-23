'use strict';

const EventEmitter = require('events');
const { load, parse, stringify } = require('./util');

/**
 * @class Endb
 * @classdesc Simple key-value database with multi adapter support.
 * @extends EventEmitter
 */
class Endb extends EventEmitter {

    /**
     * @constructor
     * @param {string} [uri] The connection string URI. (Default: undefined)
     * @param {Object} [options] The options for the database. (Default: {})
     * @param {string} [options.namespace] The name of the database. (Default: endb)
     * @param {Function} [options.serialize] A custom serialization function.
     * @param {Function} [options.deserialize] A custom deserialization function.
     * @param {string} [options.adapter] The adapter to be used.
     * @param {string} [options.collection] The name of the collection. (MongoDB)
     * @param {string} [options.table] The name of the table. (SQL database)
     * @param {number} [options.keySize] The size of the key. (SQL database)
     * @example
     * const db = new Endb(); // Memory
     * const db = new Endb({
     *     namespace: 'endb',
     *     serialize: JSON.stringify,
     *     deserialize: JSON.parse
     * });
     * const endb = new Endb('leveldb://path/to/database');
     * const db = new Endb('redis://user:pass@localhost:6379');
     * const db = new Endb('mongodb://user:pass@localhost:27017/dbname');
     * const db = new Endb('sqlite://path/to/database.sqlite');
     * const db = new Endb('postgresql://user:pass@localhost:5432/dbname');
     * const db = new Endb('mysql://user:pass@localhost:3306/dbname');
     */
    constructor(uri, options = {}) {
        super();
        this.options = Object.assign({
            namespace: 'endb',
            serialize: stringify,
            deserialize: parse
        }, (typeof uri === 'string') ? { uri } : uri, options);
        if (!this.adapter) {
            const opts = Object.assign({}, this.options);
            this.adapter = load(opts);
        }
        if (typeof this.adapter.on === 'function') {
            this.adapter.on('error', err => this.emit('error', err));
        }
        this.adapter.namespace = this.options.namespace;
    }

    /**
     * Gets all the elements (keys and values) from the database.
     * @returns {Promise<Object>}
     * @example
     * Endb.all().then(console.log).catch(console.error);
     */
    all() {
        return Promise.resolve()
            .then(() => this.adapter.all())
            .then(data => {
                data = typeof data == 'string' ? this.options.deserialize(data) : data;
                return data === undefined ? undefined : data;
            });
    }

    /**
     * Deletes all the elements (keys and values) from the database.
     * @returns {Promise<void>}
     * @example
     * Endb.clear().then(console.log).catch(console.error);
     */
    clear() {
        return Promise.resolve()
            .then(() => this.adapter.clear());
    }

    /**
     * Deletes an element (key and value) from the database.
     * @param {string|number} key The key of an element.
     * @returns {Promise<true>} Whether or not, the key has been deleted.
     * @example
     * Endb.delete('key').then(console.log).catch(console.error);
     */
    delete(key) {
        key = this._prefixKey(key);
        return Promise.resolve()
            .then(() => this.adapter.delete(key));
    }

    /**
     * Gets an element (key and value) specified from the database.
     * @param {string|number} key The key of the element.
     * @param {Object} [options={}] The options for the get.
     * @returns {Promise<*>} The value of the element.
     * @example
     * Endb.get('key').then(console.log).catch(console.error);
     */
    get(key) {
        key = this._prefixKey(key);
        return Promise.resolve()
            .then(() => this.adapter.get(key))
            .then(data => {
                data = typeof data == 'string' ? this.options.deserialize(data) : data;
                return data === undefined ? undefined : data;
            });
    }

    /**
     * Sets an element (key and a value) to the database.
     * @param {string|number} key The key of the element.
     * @param {*} value The value of the element.
     * @returns {Promise<boolean>} Whether or not, the element has been assigned.
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
        return Promise.resolve()
            .then(() => {
                return this.adapter.set(key, this.options.serialize(value));
            })
            .then(() => true);
    }

    _prefixKey(key) {
        return this.options.namespace ? `${this.options.namespace}:${key}` : key;
    }
}

module.exports = Endb;