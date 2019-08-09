'use strict';

function isNumeric(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
};

module.exports = isNumeric;