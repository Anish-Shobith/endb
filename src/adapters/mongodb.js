'use strict';

const EventEmitter = require('events');
const { promisify } = require('util');
const { safeRequire } = require('../util');
const mongojs = safeRequire('mongojs');

class EndbMongo extends EventEmitter {
	constructor(url, options = {}) {
		super();
		url = url || {};
		if (typeof url === 'string') {
			url = { url };
		}
		if (url.uri) {
			url = Object.assign({ url: url.uri }, url);
		}
		options = Object.assign({
			url: 'mongodb://127.0.0.1:27017',
			collection: 'endb'
		}, url, options);
		const mongo = mongojs(options.uri);
		const collection = mongo.collection(options.collection);
		collection.createIndex({ key: 1 }, {
			unique: true,
			background: true
		});
		this.db = ['update', 'find', 'findOne', 'remove'].reduce((obj, method) => {
			obj[method] = promisify(collection[method].bind(collection));
			return obj;
		}, {});
		mongo.on('error', err => this.emit('error', err));
	}

	all() {
		return this.db.find()
			.then(data => {
				return data.map(doc => doc === null ? undefined : doc.value);
			});
	}

	clear() {
		return this.db.remove({ key: new RegExp(`^${this.namespace}:`) })
			.then(() => undefined);
	}

	delete(key) {
		return this.db.remove({ key })
			.then(data => data.n > 0);
	}

	get(key) {
		return this.db.findOne({ key })
			.then(data => {
				return data === null ? undefined : data.value;
			});
	}

	set(key, value) {
		return this.db.update({ key }, { key, value }, { upsert: true });
	}
}

module.exports = EndbMongo;