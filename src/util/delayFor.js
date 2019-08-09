'use strict';

function delayFor(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

module.exports = delayFor;