'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');

describe('lib/imageset-uploader', () => {
	let imagesetUploader;
	let express;

	beforeEach(() => {
		express = require('../mock/n-express.mock');
		mockery.registerMock('@financial-times/n-express', express);

		imagesetUploader = require('./../../../lib/imageset-uploader');
	});

	it('exports a function', () => {
		assert.isFunction(imagesetUploader);
	});

	describe('imagesetUploader()', () => {
		let imagesetUploaderApp;

		beforeEach(() => {
			imagesetUploaderApp = imagesetUploader();
		});

		it('returns a promise', () => {
			assert.instanceOf(imagesetUploaderApp, Promise);
		});

		it('creates an Express app', () => {
			assert.calledOnce(express);
		});

		it('loads all of the routes', () => {
			assert.calledOnce(express.mockApp.get);
			assert.calledWith(express.mockApp.get, '/');
			assert.calledOnce(express.mockApp.post);
			assert.equal(express.mockApp.post.args[0].length, 3);
			assert.equal(express.mockApp.post.args[0][0], '/release');
			assert.isFunction(express.mockApp.post.args[0][1]);
			assert.equal(express.mockApp.post.args[0][2], require('./../../../lib/release-route').routeHandler);
		});

		it('starts the Express application on the default port', () => {
			assert.calledOnce(express.mockApp.listen);
			assert.calledWith(express.mockApp.listen, 8080);
		});

		describe('.then()', () => {
			let service;

			beforeEach(() => {
				return imagesetUploaderApp.then(value => {
					service = value;
				});
			});

			it('resolves with the created Express application', () => {
				assert.strictEqual(service, express.mockApp);
			});

			it('stores the created server in the Express application `server` property', () => {
				assert.strictEqual(service.server, express.mockServer);
			});
		});

		describe('when the Express application errors on startup', () => {
			let expressError;

			beforeEach(() => {
				expressError = new Error('Express failed to start');
				express.mockApp.listen.rejects(expressError);
				imagesetUploaderApp = imagesetUploader();
			});

			describe('.catch()', () => {
				let caughtError;

				beforeEach(done => {
					imagesetUploaderApp.then(done).catch(error => {
						console.log(error);
						caughtError = error;
						done();
					});
				});

				it('fails with the Express error', () => {
					assert.strictEqual(caughtError, expressError);
				});
			});
		});
	});
});
