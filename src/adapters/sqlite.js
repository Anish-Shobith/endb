'use strict';

const { promisify } = require('util');
const { safeRequire } = require('../util');
const EndbSql = require('./sql');
const { Database } = safeRequire('sqlite3');

class EndbSqlite extends EndbSql {
    constructor(options = {}) {
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
                        db.configure('busyTimeout', options.busyTimeout);
                    }
                    resolve(db);
                }
            });
        }).then(db => promisify(db.all).bind(db));
        super(options);
    }
}

module.exports = EndbSqlite;