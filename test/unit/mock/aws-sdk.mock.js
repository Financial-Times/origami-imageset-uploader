'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub();
module.exports.config = {};
const S3 = sinon.stub();
S3.prototype.putObject = sinon.stub().returns({
	promise: sinon.stub().returns(Promise.resolve())
});
module.exports.S3 = S3;
