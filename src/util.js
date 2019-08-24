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
                return new (require(adapters[adapter]))(options);
            }
        }
        return new Map();
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

    static parse(text) {
        const isObject = (x) => typeof x === 'object' && x !== null;
        const isBuffer = (x) => {
            return (isObject(x) && x.type === 'Buffer' && (Array.isArray(x.data) || typeof x.data === 'string'));
        };
        return JSON.parse(text, (k, v) => {
            if (isBuffer(v)) {
                if (Array.isArray(v.data)) {
                    return Buffer.from(v.data);
                } else if (typeof v.data === 'string') {
                    if (v.data.startsWith('base64:')) {
                        return Buffer.from(v.data.slice('base64:'.length), 'base64');
                    }
                    return Buffer.from(v.data);
                }
            }
            return v;
        });
    }

    static stringify(value, space) {
        const isObject = (x) => typeof x === 'object' && x !== null;
        const isBuffer = (x) => {
            return (isObject(x) && x.type === 'Buffer' && (Array.isArray(x.data) || typeof x.data === 'string'));
        };
        return JSON.stringify(value, (k, v) => {
            if (isBuffer(v)) {
                if (Array.isArray(v.data)) {
                    if (v.data.length > 0) {
                        v.data = `base64:${Buffer.from(v.data).toString('base64')}`;
                    } else {
                        v.data = '';
                    }
                }
            }
            return v;
        }, space);
    }
}

module.exports = Util;