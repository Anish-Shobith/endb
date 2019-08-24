'use strict';

const Endb = require('../src/index');
const test = require('ava');

test.serial('Class', t => {
    t.is(typeof Endb, 'function');
    t.throws(() => Endb());
    t.notThrows(() => new Endb());
});