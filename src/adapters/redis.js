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
		client.on('error', (err) => this.emit('error', err));
	}

	all() {
		return this.db.keys('*')
			.then(data => {
				for (let i = 0; i < data.length; i++) {
					return data[i] === null ? null : data[i];
				}
			});
	}

	clear() {
		return this.db.smembers(this._prefixNamespace())
			.then(data => this.db.del.apply(null, data.concat(this._prefixNamespace())))
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
				return data === null ? null : data;
			});
	}

	set(key, value) {
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