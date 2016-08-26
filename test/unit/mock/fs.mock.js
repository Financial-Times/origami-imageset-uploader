'use strict';

const sinon = require('sinon');
require('sinon-as-promised');

module.exports = sinon.stub();
module.exports.rmdir = sinon.stub().callsArg(1);
module.exports.readdir = sinon.stub().callsArgWith(1, undefined, ['file1', 'file2']);
module.exports.createReadStream = sinon.stub().returns('stream');
