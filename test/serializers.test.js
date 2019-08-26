'use strict';

const test = require('ava');
const Endb = require('../src/index');

test.serial('Custom Serializers', async t => {
	t.plan(2);
	const endb = new Endb({
		store: new Map(),
		serialize: JSON.stringify,
		deserialize: JSON.parse
	});
	t.is(await endb.set('foo', 'bar'), true);
	t.is(await endb.get('foo'), 'bar');
});