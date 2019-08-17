'use strict';

const { safeRequire } = require('../util');
const SqlDialect = require('./sql');
const { Database } = safeRequire('sqlite3');
const { promisify } = require('util');

class SqliteDialect extends SqlDialect {
    constructor(options) {
        options = Object.assign({
            dialect: 'sqlite',
            uri: 'sqlite://:memory:'
        }, options);
        options.path = options.uri.replace(/^sqlite:\/\//, '');
        options.connect = () => new Promise((resolve, reject) => {
            const db = new Database(options.path, err => {
                if (err) {
                    reject(err);
                } else {
                    if (options.busyTimeout) {
                        db.configure('busyTimeout', tis.options.busyTimeout);
                    }
                    resolve(db);
                }
            });
        }).then(db => promisify(db.all).bind(db));
        super(options);
    }
}

module.exports = SqliteDialect;