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

    static addModel(model) {
        return this.models.push(model);
    }

    /**
     * 
     * @param {string} name The name of the model
     * @param {Object} schema The attributes of the model
     * @param {Object} [options] The options for the function
     */
    static define(name, schema = {}, options = {}) {
        if (typeof name !== 'string' || typeof name === 'undefined') {
            throw new Error('Name must be a string', 'EndbTypeError');
        }
        options.endb = this;
        options.name = typeof name === 'string' ? name.replace(/[^a-z0-9]/gi, '_') : 'endb'; 
        options.columns = Object.keys(schema).map(col => (`\`${col}\` ${schema[col]}`));
        const model = new Model(schema, options);
        this.models = [];
        this.models.push(model);
        return model;
    }

    static models() {
        return this.models;
    }
}

module.exports = Endb;
module.exports.Error = Error;
module.exports.Model = Model;
module.exports.Util = Util;
module.exports.Types = Util.DataTypes;