'use strict';

const { EndbError } = require('./EndbError');

module.exports = {
    Options: {
        name: 'endb',
        fileName: 'endb',
        path: './',
        fileMustExist: false,
        timeout: 5000,
        wal: true
    },
    cloneObject: function(obj = {}) {
        return Object.assign(Object.create(obj), obj);
    },
    mergeDefault: function(def = {}, given) {
        if (!given) return def;
        for (const key in def) {
            if (!Object.prototype.hasOwnProperty.call(given, key) || given[key] === undefined) {
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = Util.mergeDefault(def[key], given[key]);
            }
        }
        return given;
    },
    validateOptions: function(options = this.Options) {
        if (typeof options.name !== 'string') {
            throw new EndbError('The option "name" must be a string', 'ENDB_INVALID_OPTION');
        }
        if (typeof options.fileName !== 'string') {
            throw new EndbError('The option "fileName" must be a string', 'ENDB_INVALID_OPTION');
        }
        if (typeof options.path !== 'string') {
            throw new EndbError('The option "path" must be a string', 'ENDB_INVALID_OPTION');
        }
        if (typeof options.fileMustExist !== 'boolean') {
            throw new EndbError('The option "fileMustExist" must be a boolean', 'ENDB_INVALID_OPTION');
        }
        if (typeof options.timeout !== 'number') {
            throw new EndbError('The option "timeout" must be a number', 'ENDB_INVALID_OPTION');
        }
        if (typeof options.wal !== 'boolean') {
            throw new EndbError('The option "wal" must be a boolean', 'ENDB_INVALID_OPTION');
        }
    }
};