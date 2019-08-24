const Endb = require('../src/index');
const test = require('ava');

test.serial('Namespaces', async t => {
    const endb1 = new Endb({
        namespace: 'endb1'
    });
    const endb2 = new Endb({
        namespace: 'endb2'
    });
    t.is(await endb1.set('foo', 'bar'), true);
    t.is(await endb2.set('bar', 'foo'), true);
    t.is(await endb1.get('foo'), 'bar');
    t.is(await endb2.get('bar'), 'foo');
    t.is(await endb1.clear(), undefined);
    t.is(await endb1.get('foo'), undefined);
    t.is(await endb2.get('bar'), 'foo');
});