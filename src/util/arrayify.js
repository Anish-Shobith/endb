'use strict';

function arrayify(array) {
    return Array.isArray(array) ? array : [array];
};

module.exports = arrayify;