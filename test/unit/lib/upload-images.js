'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const path = require('path');

describe('lib/upload-images', () => {
	const dirName = 'test-1';
	const pathToImages = 'src';
	let fullPath;
	let uploadImages;
	let aws;
	let fs;

	beforeEach(() => {
		process.env.DOWNLOAD_DIRECTORY = 'imagesets';
		fullPath = path.resolve('tmp', process.env.DOWNLOAD_DIRECTORY, dirName, pathToImages);
		aws = require('./../mock/aws-sdk.mock');
		mockery.registerMock('aws-sdk', aws);
		fs = require('./../mock/fs.mock');
		mockery.registerMock('fs', fs);
		uploadImages = require('./../../../lib/upload-images');
	});

	it('exports a function', () => {
		assert.isFunction(uploadImages);
	});

	it('sets AWS region', () => {
		assert.equal(aws.config.region, 'us-west-2');
	});

	describe('uploadImages', () => {
		let uploadedImages;
		beforeEach(() => {
			uploadedImages = uploadImages({dirName, pathToImages});
		});

		it('should return a Promise', () => {
			assert.instanceOf(uploadedImages, Promise);
		});

		describe('then()', () => {
			let resolvedValue;

			beforeEach((done) => {
				uploadedImages.then((resolvedDir) => {
					resolvedValue = resolvedDir;
					done();
				});
			});

			it('should resolve with dirName', () => {
				assert.equal(resolvedValue, dirName);
			});

			it('should call fs.readdir with correct path', () => {
				assert.calledOnce(fs.readdir);
				assert.calledWith(fs.readdir, fullPath);
			});

			it('should upload all files to S3', () => {
				assert.calledTwice(fs.createReadStream);
				assert.calledWith(fs.createReadStream, path.resolve(fullPath, 'file1'));
				assert.calledWith(fs.createReadStream, path.resolve(fullPath, 'file2'));
				assert.calledTwice(aws.S3.prototype.putObject);
				assert.calledWith(aws.S3.prototype.putObject, {
					Key: path.join('test', '1', 'file1'),
					Body: 'stream'
				});
				assert.calledWith(aws.S3.prototype.putObject, {
					Key: path.join('test', '1', 'file2'),
					Body: 'stream'
				});
			});
		});

		describe('catch()', () => {

		});
	});
});
