'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub();
module.exports.resolves('test-1');
