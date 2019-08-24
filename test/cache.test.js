const Endb = require('../src/index');
const test = require('ava');

test.serial('Adapters (Cache)', async t => {
    const store = new Map();
    const endb = new Endb({ store });
    t.is(store.size, 0);
    t.is(await endb.set('foo', 'bar'), true);
    t.is(await endb.get('foo'), 'bar');
    t.is(store.size, 1);
});