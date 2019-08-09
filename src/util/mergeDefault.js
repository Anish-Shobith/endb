'use strict';

function mergeDefault(def = {}, given) {
    if (!given) return def;
        for (const key in def) {
            if (!Object.prototype.hasOwnProperty.call(given, key) || given[key] === undefined) {
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = mergeDefault(def[key], given[key]);
            }
        }
        return given;
};

module.exports = mergeDefault;