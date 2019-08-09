'use strict';

const deprecations = new Set();

function deprecate(message) {
  if (!deprecations.has(message)) {
    deprecations.add(message);
    console.warn(message);
  }
};

module.exports = deprecate;