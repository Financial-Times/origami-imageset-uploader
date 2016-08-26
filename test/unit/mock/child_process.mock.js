'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub();

module.exports.execFunction = (property, callback) => {
	callback(undefined, property);
};
// A bit more complex as it needs to follow the callback
// pattern for denodeify to work properly
module.exports.exec = sinon.spy(module.exports.execFunction);
