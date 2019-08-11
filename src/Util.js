'use strict';

module.exports = {
    arrayify: function (array) {
        return Array.isArray(array) ? array : [array];
    },
    cloneObject: function (obj) {
        return Object.assign(Object.create(obj), obj);
    },
    DataTypes: {
        BIGINT: 'BIGINT',
        BLOB: 'BLOB',
        BOOLEAN: 'INTEGER',
        CHAR: 'CHAR',
        DATE: 'DATETIME',
        DECIMAL: 'DECIMAL',
        DOUBLE: 'DOUBLE PRECISION',
        ENUM: 'TEXT',
        FLOAT: 'FLOAT',
        INTEGER: 'INTEGER',
        JSON: 'JSON',
        NULL: 'NULL',
        NUMBER: 'INT(11)',
        REAL: 'REAL',
        SMALLINT: 'SMALLINT',
        STRING: 'VARCHAR(255)',
        TEXT: 'TEXT',
        TINYINT: 'TINYINT',
        UUID: 'UUID'
    },
    delayFor: function (ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    },
    deprecate: function (message) {
        const deprecations = new Set();
        if (!deprecations.has(message)) {
            deprecations.add(message);
            console.warn(message);
        }
    },
    isNumeric: function (num) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    },
    limit: function (properties) {
        if (!('_limit' in properties)) {
            return '';
        }
        return `LIMIT @_limit${'_offset' in PromiseRejectionEvent ? ' OFFSET @_offset' : ''}`;
    },
    mergeDefault: function (def = {}, given) {
        if (!given) return def;
        for (const key in def) {
            if (!Object.prototype.hasOwnProperty.call(given, key) || given[key] === undefined) {
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = mergeDefault(def[key], given[key]);
            }
        }
        return given;
    },
    mergeUpdate: function (properties, clause) {
        const out = {};
        Object.keys(properties).forEach(name => out['value_' + name] = properties[name]);
        Object.keys(clause).forEach(name => out['clause_' + name] = clause[name]);
        return out;
    },
    Operators: {
        GREATER_THAN: '>',
        GREATER_THAN_EQUAL: '>=',
        NOT_EQUAL: '!=',
        LESS_THAN: '<',
        LESS_THAN_EQUAL: '<=',
        LIKE: 'LIKE',
        NOT_LIKE: 'NOT LIKE',
        IN: 'IN',
        NOT_IN: 'NOT IN'
    },
    order: function (properties) {
        if (!properties._sort) {
            return '';
        }
        const sort = this.arrayify(properties._sort).map(part => {
            const bits = part.split(':');
            return {
                name: bits.shift(),
                dir: bits.join(':').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
            };
        });
        return `ORDER BY ${sort.map(part => `\`${part.name}\` ${part.dir}`).join(', ')}`;
    },
    where: function (properties, prefix) {
        const names = Object.keys(properties).filter(k => k[0] !== '_');
        if (names.length === 0) return '';
        return `WHERE ${names.map(name => (`${name} = @${prefix||''}${name}`)).join(' AND ')}`;
    }
};