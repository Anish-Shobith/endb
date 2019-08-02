'use strict';

module.exports = {
    DataTypes: {
        BLOB: 'BLOB',
        BOOLEAN: 'TINYINT(1)',
        DATE: 'DATETIME',
        ENUM: 'TEXT',
        FLOAT: 'FLOAT',
        INTEGER: 'INTEGER',
        NULL: 'NULL',
        NUMBER: 'INT(11)',
        REAL: 'REAL',
        STRING: 'VARCHAR(255)',
        TEXT: 'TEXT'
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
    isNumeric: function(num) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    },
    entries: function*(obj) {
        for (let key of Object.keys(obj)) {
            yield [key, obj[key]];
        }
    },
    where: function(properties = {}, prefix) {
        const names = Object.keys(properties).filter(k => k[0] !== '_');
        if (names.length === 0) return '';
        return `WHERE ${names.map(name => (`${name} = @${prefix||''}${name}`)).join(' AND ')}`;
    },
    arrayify: function(array) {
        return Array.isArray(array) ? array : [array];
    },
    mergeUpdate: function(properties, clause) {
        const out = {};
        Object.keys(properties).forEach(name => out['value_' + name] = properties[name]);
        Object.keys(clause).forEach(name => out['clause_' + name] = clause[name]);
        return out;
    }
};