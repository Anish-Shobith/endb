'use strict';

function mergeUpdate(properties, clause) {
    const out = {};
    Object.keys(properties).forEach(name => out['value_' + name] = properties[name]);
    Object.keys(clause).forEach(name => out['clause_' + name] = clause[name]);
    return out;
};

module.exports = mergeUpdate;