'use strict';

const { EndbError: Error } = require('./EndbError');
const Model = require('./Model');
const Util = require('./Util');

/**
 * The main class and the entry point to endb
 */
class Endb {

    constructor(options = {}) {
        this.options = options;
    }

    static define(name, schema = {}, options = {}) {
        if (typeof name !== 'string' || typeof name === 'undefined') {
            throw new Error('Name must be a string', 'EndbTypeError');
        }
        options.endb = this;
        options.name = typeof name === 'string' ? name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'endb'; 
        options.columns = Object.keys(schema).map(col => (`\`${col}\` ${schema[col]}`));
        const model = new Model(schema, options);
        this.models = [];
        this.models.push(model);
        return model;
    }

    /**
    destroy() {
        this[check]();
        this.deleteAll();
        this.isDestroyed = true;
        this._db.prepare(`DROP TABLE IF EXISTS ${this.name};`).run();
        return null;
    }
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

    has(key) {
        this[check]();
        if (key == null || !['String', 'Number'].includes(key.constructor.name)) {
            throw new EndbError('Key must be a string or number', 'ENDB_TYPE_ERROR');
        }
        const data = this._db.prepare(`SELECT * FROM ${this.name} WHERE key = ?;`).get(key);
        return data ? true : false;
    }
    */
}

module.exports = Endb;
module.exports.Error = Error;
module.exports.Model = Model;
module.exports.Util = Util;
module.exports.Types = Util.DataTypes;