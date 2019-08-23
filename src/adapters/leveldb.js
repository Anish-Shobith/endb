'use strict';

const EventEmitter = require('events');
const { promisify } = require('util');
const { safeRequire } = require('../util');
const Level = safeRequire('level');

class EndbLevel extends EventEmitter {
    constructor(uri, options = {}) {
        super();
        options = Object.assign({
            uri: 'leveldb://endb'
        }, typeof uri === 'string' ? { uri } : uri, options);
        options.path = options.uri.replace(/^leveldb:\/\//, '');
        const level = new Level(options.path, options, err => this.emit('error', err));
        this.db = ['del', 'createKeyStream', 'createReadStream', 'get', 'put'].reduce((obj, method) => {
            obj[method] = promisify(level[method].bind(level));
            return obj;
        }, {});
    }

    all() {
        return this.db.createReadStream().then(stream => {
            stream.on('data', data => {
                return data === null ? undefined : data;
            });
        });
    }

    clear() {
        return this.db.createKeyStream()
            .then(stream => {
                stream.on('data', async data => {
                    await this.db.del(data);
                });
            });
    }

    delete(key) {
        return this.db.del(key)
            .then(data => data > 0);
    }

    get(key) {
        return this.db.get(key)
            .then(data => {
                if (data === null) return null;
                return data;
            });
    }

    set(key, value) {
        return this.db.put(key, value);
    }
}

module.exports = EndbLevel;