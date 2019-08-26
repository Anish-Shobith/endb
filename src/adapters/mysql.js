'use strict';

const EndbSql = require('./sql');
const { safeRequire } = require('../util');
const { createConnection } = safeRequire('mysql2/promise');

class EndbMysql extends EndbSql {
	constructor(options = {}) {
		if (typeof options === 'string') {
			options = { uri: options };
		}
		options = Object.assign({
			dialect: 'mysql',
			uri: 'mysql://localhost'
		}, options);
		options.connect = () => Promise.resolve()
			.then(() => createConnection(options.uri))
			.then(connection => {
				return sql => connection.execute(sql)
					.then(data => data[0]);
			});
		super(options);
	}
}

module.exports = EndbMysql;