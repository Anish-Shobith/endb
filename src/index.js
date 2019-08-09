'use strict';

const DataTypes = require('./util/DataTypes');
const Model = require('./Model');

/**
 * @class Endb
 * @classdesc
 * The database and main class
 */
class Endb {
    constructor(options = {}) {

        /**
         * The options of the database
         * @type {Object}
         */
        this.options = options;
    }

    /**
     * Creates a new model, representing a table in the database
     * @method Endb#model
     * @param {string} name The name of the model
     * @param {Object} schema The attributes of the model. Each attribute is a column in the database
     * @param {Object} [options] The options for the function
     * @returns {Model}
     * @example
     * const Model = Endb.model('Model', {
     *     id: Endb.Types.NUMBER,
     *     username: Endb.Types.STRING,
     *     verified: Endb.Types.BOOLEAN
     * });
     * 
     * Model.insert({
     *    id: 123456789,
     *    username: 'username',
     *    verified: true
     * });
     */
    static model(name, schema = {}, options = {}) {
        if (typeof name !== 'string') throw new TypeError('Name must be a string');
        options.endb = this;
        options.name = name.replace(/[^a-z0-9]/gi, '_');
        options.schema = schema;
        options.columns = Object.keys(schema).map(col => (`\`${col}\` ${schema[col]}`));
        const model = new Model(schema, options);
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
module.exports.version = require('../package.json').version;