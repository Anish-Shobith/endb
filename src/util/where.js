'use strict';

function where(properties, prefix) {
    const names = Object.keys(properties).filter(k => k[0] !== '_');
    if (names.length === 0) return '';
    return `WHERE ${names.map(name => (`${name} = @${prefix||''}${name}`)).join(' AND ')}`;
};

module.exports = where;