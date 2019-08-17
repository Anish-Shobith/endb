'use strict';

const EventEmitter = require('events');
const { safeRequire } = require('../util');
const mongojs = safeRequire('mongojs');
const { promisify } = require('util');

class MongoDialect extends EventEmitter {
    constructor(options) {
        super();
        this.options = Object.assign({
            uri: 'mongodb://127.0.0.1:27017',
            collection: 'endb'
        }, options.uri, options);
        this.db = mongojs(this.options.uri);
        const collection = this.db.collection(this.options.collection);
        collection.createIndex({ key: 1 }, { unique: true, background: true });
        this.mongo = ['update', 'findOne', 'remove'].reduce((obj, method) => {
            obj[method] = promisify(collection[method].bind(collection));
            return obj;
        }, {});
        this.db.on('error', err => this.emit('error', err));
    }

    all() {
        return this.mongo.find()
            .then(doc => {
                if (doc == null) return undefined;
                return doc;
            });
    }

    clear() {
        return this.mongo.remove({ key: new RegExp(`^${this.options.namespace}:`) })
            .then(() => undefined);
    }

    delete(key) {
        return this.mongo.remove({ key })
            .then(obj => obj.n > 0);
    }

    get(key) {
        return this.mongo.findOne({ key })
            .then(doc => {
                if (doc == null) return undefined;
                return doc.value;
            });
    }

    set(key, value) {
        return this.mongo.update({ key }, { key, value }, { upsert: true });
    }
}

module.exports = MongoDialect;