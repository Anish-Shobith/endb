'use strict';

const EventEmitter = require('events');
const safeRequire = require('../util/safeRequire');
const redis = safeRequire('redis');
const { promisify } = require('util');

class RediaDialect extends EventEmitter {
    constructor(options) {
        super();
        this.options = Object.assign({}, options.uri, options);
        const client = redis.createClient(this.options);
        this.redis = ['get', 'set', 'sadd', 'del', 'srem', 'smembers'].reduce((obj, method) => {
            obj[method] = promisify(client[method].bind(client));
            return obj;
        }, {});
        client.on('error', err => this.emit('error', err));
    }

    clear() {
        return this.redis.smembers(this._prefixNamespace())
            .then(keys => this.redis.del.apply(null, keys.concat(this._prefixNamespace())))
            .then(() => undefined);
    }

    delete(key) {
        return this.redis.del(key)
            .then(items => {
                return this.redis.srem(this._prefixNamespace())
                    .then(() => items > 0);
            });
    }

    get(key) {
        return this.redis.get(key)
            .then(value => {
                if (value == null) return undefined;
                return value;
            });
    }

    set(key, value) {
        return Promise.resolve()
            .then(() => {
                return this.redis.set(key, value);
            })
            .then(() => this.redis.sadd(this._prefixNamespace(), key));
    }

    _prefixNamespace() {
        return `namespace:${this.options.namespace}`;
    }
}

module.exports = RediaDialect;