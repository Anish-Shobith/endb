# Endb

[![NPM Version](https://badgen.net/npm/v/endb)](https://www.npmjs.com/package/endb)
[![Build Status](https://travis-ci.org/enhancd/endb.svg?branch=master)](https://travis-ci.org/enhancd/endb)
[![NPM Downloads](https://badgen.net/npm/dt/endb)](https://www.npmjs.com/package/endb)
[![GitHub Stars](https://badgen.net/github/stars/enhancd/endb)](https://github.com/enhancd/endb)
[![Node Version](https://badgen.net/npm/node/endb)](https://www.npmjs.com/package/endb)
[![License](https://badgen.net/github/license/enhancd/endb)](https://github.com/enhancd/endb/blob/master/LICENSE)
[![Patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/endb)

Simple key-value database with cache and multi adapter support.
Supported adapters are LevelDB, MongoDB, MySQL, PostgreSQL, Redis, and SQLite.

New to Endb? Check out the [API Reference](https://endb.js.org)

* High performance, efficiency, and safety
* Simplistic, reliable, and fast
* Simple [Promise-based API](#Usage)
* Suitable as cache or persistent key-value database
* Supports [namespaces](#Namespaces)
* Handles all JSON types including Buffer
* Easily embeddable inside a module

## Installation
```bash
npm install --save endb
```
By default, data is stored in the memory. You can optionally install an adapter.
```bash
$ npm install --save level # LevelDB
$ npm install --save mongojs # MongoDB
$ npm install --save redis

# To use SQL database, install an additional 'sql' package and the adapter
$ npm install --save sql

$ npm install --save mysql2 # MySQL
$ npm install --save pg # PostgreSQL
$ npm install --save sqlite3 # SQLite
```

## Usage
```js
const Endb = require('endb');

// Adapters
const endb = new Endb();
const endb = new Endb('leveldb://path/to/database');
const endb = new Endb('redis://user:pass@localhost:6379');
const endb = new Endb('mongodb://user:pass@localhost:27017/dbname');
const endb = new Endb('sqlite://path/to/database.sqlite');
const endb = new Endb('postgresql://user:pass@localhost:5432/dbname');
const endb = new Endb('mysql://user:pass@localhost:3306/dbname');

// Handles database connection error
endb.on('error', err => console.log('Connection Error: ', err));

await endb.set('foo', 'bar'); // true
await endb.get('foo'); // 'bar'
await endb.get('foo', { raw: true }); // { value: 'bar' }
await endb.has('foo'); // true
await endb.has('bar'); // false
await endb.delete('foo'); // true
await endb.clear(); // undefined
```

### Namespaces
You can set a namespace to avoid key collisions and namespaces allow you to clear only a certain namespace while using the same database.
```js
const users = new Endb('redis://user:pass@localhost:6379', { namespace: 'users' });
const cache = new Endb('redis://user:pass@localhost:6379', { namespace: 'cache' });

await users.set('foo', 'users'); // true
await cache.set('foo', 'cache'); // true
await users.get('foo'); // 'users'
await cache.get('foo'); // 'cache'
await users.clear(); // undefined
await users.get('foo'); // undefined
await cache.get('foo'); // 'cache'
```

### Custom Serializers
It uses JSON buffer for serialization and derialization of data to ensure consistency.
You can optionally pass your own (de)serialization functions to support extra data types or to (de)serialize to something other than JSON.
```js
const db = new Endb({
    serialize: JSON.stringify,
    deserialize: JSON.parse
});
```

## Third-party Adapters
You can also use third-party adapters or build your own.
It will integrate these storage adapters and handle complex types internally.
```js
const customAdapter = require('./custom-adapter');
const endb = new Endb({ store: customAdapter });
```
For instance, [`quick-lru`](https://github.com/sindresorhus/quick-lru) is compatible with Endb since it implements Map.
```js
const QuickLRU = require('quick-lru');
const endb = new Endb({ store: new QuickLRU({ maxSize: 1000 }) });
```
The following are third-party adapters compatible:
* [quick-lru](https://github.com/sindresorhus/quick-lru) - Simple "Least Recently Used" (LRU) cache

## License
Copyright (c) enhancd. All rights reserved.

Licensed under the [MIT](https://github.com/enhancd/endb/blob/master/LICENSE) license.