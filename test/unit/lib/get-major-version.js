'use strict';

const assert = require('chai').assert;

describe('lib/get-major-version', () => {
	let getMajorVersion;

	beforeEach(() => {
		getMajorVersion = require('./../../../lib/get-major-version');
	});

	it('exports a function', () => {
		assert.isFunction(getMajorVersion);
	});

	describe('getMajorVersion', () => {
		let majorVersion;

		beforeEach(() => {
			majorVersion = getMajorVersion('v3.2.1');
		});

		it('should return a string', () => {
			assert.isString(majorVersion);
		});

		it('should only contain digits', () => {
			assert.isNotNull(majorVersion.match(/^\d+$/));
		});

		it('should contain correct major version', () => {
			assert.equal(majorVersion, 3);
		});

		describe('invalid tag', () => {
			beforeEach(() => {
				majorVersion = getMajorVersion('v100');
			});

			it('should return `undefined`', () => {
				assert.isUndefined(majorVersion);
			});
		});
	});
});
