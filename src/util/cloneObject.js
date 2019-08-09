'use strict';

function cloneObject(obj) {
    return Object.assign(Object.create(obj), obj);
};

module.exports = cloneObject;