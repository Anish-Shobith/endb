'use strict';

module.exports = function(module) {
    try {
        return require(module);
    } catch (err) {
        throw new Error(`Run "npm i ${module}" to install the package`);
    }
};