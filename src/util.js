'use strict';

class Util {
    constructor() {
        throw new Error('Util must not be constructed');
    }

    static load(options = {}) {
        const adapters = {
            level: './adapters/leveldb',
            mongo: './adapters/mongodb',
            mysql: './adapters/mysql',
            postgres: './adapters/postgres',
            redis: './adapters/redis',
            sqlite: './adapters/sqlite'
        };
        if (options.adapter || options.uri) {
            const adapter = options.adapter || /^[^:]*/.exec(options.uri)[0];
            if (adapters[adapter] !== undefined) {
                const Adapter = require(adapters[adapter]);
                return new Adapter(options);
            } else {
                return adapter;
            }
        }
        return new Map();
    }

    static parse(text) {
        return JSON.parse(text, (key, value) => {
            if ('string' === typeof value) {
                if (/^:base64:/.test(value))
                    return Buffer.from(value.substring(8), 'base64');
            } else {
                return /^:/.test(value) ? value.substring(1) : value;
            }
            return value;
        });
    }

    static rowsToObject(rows) {
        const r = {};
        for (const i in rows) {
            const row = rows[i];
            const key = row.key;
            r[key] = row.value;
        }
        return r;
    }

    static safeRequire(id) {
        try {
            return require(id);
        } catch (err) {
            console.log('\x1b[1m\x1b[31m%s\x1b[0m', `To continue, you'll have to install ${id}. Run "npm install ${id}" to install it.`);
            return false;
        }
    }

    static stringify(obj) {
        if ('undefined' == typeof obj) return obj;
        if (obj && Buffer.isBuffer(obj)) {
            return JSON.stringify(':base64:' + obj.toString('base64'));
        }
        if (obj && obj.toJSON) obj = obj.toJSON();
        if (obj && 'object' === typeof obj) {
            let s = '';
            const array = Array.isArray(obj);
            s = array ? '[' : '{';
            let first = true;
            for (const k in obj) {
                const ignore = 'function' == typeof obj[k] || (!array && 'undefined' === typeof obj[k]);
                if (Object.hasOwnProperty.call(obj, k) && !ignore) {
                    if (!first) s += ',';
                    first = false;
                    if (array) {
                        if (obj[k] == undefined) {
                            s += 'null';
                        } else {
                            s += stringify(obj[k]);
                        }
                    } else if (obj[k] !== void(0)) {
                        s += stringify(k) + ':' + stringify(obj[k]);
                    }
                }
            }
            s += array ? ']' : '}';
            return s;
        } else if ('string' === typeof obj) {
            return JSON.stringify(/^:/.test(obj) ? ':' + obj : obj);
        } else if ('undefined' === typeof obj) {
            return 'null';
        } else {
            return JSON.stringify(obj);
        }
    }
}

module.exports = Util;