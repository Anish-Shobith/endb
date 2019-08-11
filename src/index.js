'use strict';

const DataTypes = require('./Util').DataTypes;
const Model = require('./Model');

/**
 * @class Endb
 * @classdesc
 * The main database  class
 */
class Endb {

    /**
     * NOT IMPLEMENTED
     * Initializes a new main database
     * @constructor
     * @param {Object} [options] The options for the database
     * @example
     * const endb = require('endb');
     * const db = new endb();
     */
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Creates a new model, representing a table in the database
     * @method Endb#model
     * @param {string} name The name of the model
     * @param {Object} schema The attributes of the model. Each attribute is a column in the database
     * @param {Object} [options] The options for the function
     * @returns {Model} A new model instance, represening a table in the database
     * @example
     * const Model = Endb.model('Model', {
     *     id: Endb.NUMBER,
     *     username: Endb.STRING,
     *     verified: Endb.BOOLEAN
     * });
     * 
     * // DataTypes
     * [
     *  'BIGINT',
     *  'BLOB',
     *  'BOOLEAN',
     *  'CHAR',
     *  'DATE',
     *  'DECIMAL',
     *  'DOUBLE',
     *  'ENUM',
     *  'FLOAT',
     *  'INTEGER',
     *  'JSON',
     *  'NULL',
     *  'NUMBER',
     *  'REAL',
     *  'SMALLINT',
     *  'STRING',
     *  'TEXT',
     *  'TINYINT',
     *  'UUID'
     * ]
     * 
     * const Model = Endb.model('Model', {
     *     id: Endb.NUMBER,
     *     username: Endb.STRING,
     *     verified: Endb.BOOLEAN
     * }, { fileName: 'database', path: './data', fileMustExist: false, timeout: 5000, wal: true });
     */
    static model(name, schema, options = {}) {
        if (typeof name !== 'string') throw new TypeError('Name must be a string');
        if (typeof schema !== 'object') throw new TypeError('Schema must be an object');
        const model = new Model(schema, options);
        model.endb = this;
        model.name = name.replace(/[^a-z0-9]/gi, '_');
        model.columns = Object.keys(schema).map(col => (`\`${col}\` ${schema[col]}`));
        this.models = {};
        this.models[model.name] = model;
        return model;
    }

    /**
     * Gets all the models associated with the database
     * @method Endb#models
     * @returns {Object}
     */
    static models() {
        return this.models;
    }
}

module.exports = Endb;
module.exports.Model = Model;
module.exports.Types = DataTypes;
for (const dataType in DataTypes) {
    Endb[dataType] = DataTypes[dataType];
}