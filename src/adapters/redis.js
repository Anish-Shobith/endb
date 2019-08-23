'use strict';

const EventEmitter = require('events');
const { promisify } = require('util');
const { safeRequire } = require('../util');
const { createClient } = safeRequire('redis');

class EndbRedis extends EventEmitter {
    constructor(uri, options = {}) {
        super();
        options = Object.assign({}, typeof uri === 'string' ? { uri } : uri, options);
        if (options.uri && typeof options.url === 'undefined') {
            options.url = options.uri;
        }
        const client = createClient(options);
        this.db = ['get', 'keys', 'set', 'sadd', 'del', 'srem', 'smembers'].reduce((obj, method) => {
            obj[method] = promisify(client[method].bind(client));
            return obj;
        }, {});
        client.on('error', err => this.emit('error', err));
    }

    all() {
        return this.db.keys('*')
            .then(keys => {
                for (let i = 0; i < keys.length; i++) {
                    return keys[i] === null ? undefined : keys[i];
                }
            });
    }

    clear() {
        return this.db.smembers(this._prefixNamespace())
            .then(keys => this.db.del.apply(null, keys.concat(this._prefixNamespace())))
            .then(() => undefined);
    }

    delete(key) {
        return this.db.del(key)
            .then(data => {
                return this.db.srem(this._prefixNamespace(), key)
                    .then(() => data > 0);
            });
    }

    get(key) {
        return this.db.get(key)
            .then(data => {
                return data === null ? undefined : data;
            });
    }

    set(key, value) {
        if (typeof value === 'undefined') {
            return Promise.resolve(undefined);
        }
        return Promise.resolve()
            .then(() => {
                return this.db.set(key, value);
            })
            .then(() => this.db.sadd(this._prefixNamespace(), key));
    }

    _prefixNamespace() {
        return this.namespace ? `namespace:${this.namespace}` : undefined;
    }
}

module.exports = EndbRedis;