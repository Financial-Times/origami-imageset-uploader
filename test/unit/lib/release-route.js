'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('lib/release-route', () => {
	let releaseRoute;
	let express;
	let fetchImages;
	let uploadImages;
	let fs;

	beforeEach(() => {
		process.env.GITHUB_SECRET = 'test';
		process.env.DOWNLOAD_DIRECTORY = 'imagesets';
		express = require('../mock/n-express.mock');
		fetchImages = require('./../mock/fetch-images.mock');
		mockery.registerMock('./fetch-images', fetchImages);
		uploadImages = require('../mock/upload-images.mock');
		mockery.registerMock('./upload-images', uploadImages);
		fs = require('../mock/fs.mock');
		mockery.registerMock('fs', fs);
		releaseRoute = require('./../../../lib/release-route');
	});

	it('exports an object', () => {
		assert.isObject(releaseRoute);
	});

	it('has a routeHandler function', () => {
		assert.isFunction(releaseRoute.routeHandler);
	});

	it('has a generateSignature function', () => {
		assert.isFunction(releaseRoute.generateSignature);
	});

	describe('routeHandler', () => {
		let response;
		let request;
		let next;

		beforeEach((done) => {
			// Promises are executed in the function, and we want tests
			// to run when they have finished
			next = sinon.spy(function() {
				done();
			});
			response = express.mockResponse;
			request = require('../mock/webhook-request.mock');

			releaseRoute.routeHandler(request, response, next);
		});

		it('calls `next` with no error', () => {
			assert.calledOnce(next);
			assert.calledWithExactly(next);
		});

		describe('valid request', () => {

			it('should call fetchImages with release data', () => {
				assert.calledOnce(fetchImages);
				assert.calledWithExactly(fetchImages, {
					name: request.body.repository.name,
					url: request.body.repository.clone_url,
					tag: request.body.release.tag_name
				});
			});

			it('should call uploadImages', () => {
				assert.calledOnce(uploadImages);
				assert.calledWithExactly(uploadImages, {
					dirName: 'dir',
					pathToImages: 'path'
				});
			});

			it('should call fs.rmdir', () => {
				assert.calledOnce(fs.rmdir);
				assert.calledWith(fs.rmdir, path.resolve(process.env.DOWNLOAD_DIRECTORY, 'test-1'));
			});

			it('should respond with a 200', () => {
				assert.calledOnce(express.mockResponse.send);
				assert.calledOnce(express.mockResponse.status);
				assert.calledWithExactly(express.mockResponse.send, 'OK');
				assert.calledWithExactly(express.mockResponse.status, 200);
			});

			describe('catch()', () => {

				beforeEach(() => {
					// Resets mockResponse spies as routeHandler is called in this beforeEach
					// and in the outer one
					express.mockResponse.send.reset();
					express.mockResponse.status.reset();
				});

				describe('fetchImages fails', () => {
					let fetchImagesError;

					beforeEach((done) => {
						// Needs resetting so the done in the other beforeEach
						// isn't called twice and because we care about this done
						next = sinon.spy(function() {
							done();
						});
						fetchImagesError = new Error('Fetching Images failed');
						fetchImages.rejects(fetchImagesError);

						releaseRoute.routeHandler(request, response, next);
					});

					it('should respond with an error if fetchImages fails', () => {
						assert.calledOnce(express.mockResponse.send);
						assert.calledOnce(express.mockResponse.status);
						assert.calledWithExactly(express.mockResponse.send, fetchImagesError);
						assert.calledWithExactly(express.mockResponse.status, 500);
					});
				});

				describe('uploadImages fails', () => {
					let uploadImagesError;

					beforeEach((done) => {
						// Needs resetting so the done in the other beforeEach
						// isn't called twice and because we care about this done
						next = sinon.spy(function() {
							done();
						});
						uploadImagesError = new Error('Uploading Images failed');
						uploadImages.rejects(uploadImagesError);

						releaseRoute.routeHandler(request, response, next);
					});

					it('should respond with an error if uploadImages fails', () => {
						assert.calledOnce(express.mockResponse.send);
						assert.calledOnce(express.mockResponse.status);
						assert.calledWithExactly(express.mockResponse.send, uploadImagesError);
						assert.calledWithExactly(express.mockResponse.status, 500);
					});
				});

				describe('can\'t delete directory', () => {

					describe('uploadImages does not pass on valid directory', () => {
						const deleteDirError = 'Couldn\'t upload imageset to S3';

						beforeEach((done) => {
							// Needs resetting so the done in the other beforeEach
							// isn't called twice and because we care about this done
							next = sinon.spy(function() {
								done();
							});
							uploadImages.resolves('');
							releaseRoute.routeHandler(request, response, next);
						});

						it('should respond with an error if directory to be deleted is not valid', () => {
							assert.calledOnce(express.mockResponse.send);
							assert.calledOnce(express.mockResponse.status);
							assert.calledWithExactly(express.mockResponse.send, deleteDirError);
							assert.calledWithExactly(express.mockResponse.status, 500);
						});
					});

					describe('fs errors', () => {
						const fsError = 'fs failed';

						beforeEach((done) => {
							// Needs resetting so the done in the other beforeEach
							// isn't called twice and because we care about this done
							next = sinon.spy(function() {
								done();
							});
							uploadImages.resolves('dir');
							fs.rmdir.callsArgWith(1, fsError);
							releaseRoute.routeHandler(request, response, next);
						});

						it('should respond with an error if fs.rmdir errors', () => {
							assert.calledOnce(express.mockResponse.send);
							assert.calledOnce(express.mockResponse.status);
							assert.calledWithExactly(express.mockResponse.send, fsError);
							assert.calledWithExactly(express.mockResponse.status, 500);
						});
					});
					// Not sure what's the cleanest way to stub rmdir to get it
					// to throw an error in the callback
				});
			});
		});

		describe('non valid request', () => {

			const errorMessage = 'Needs to be an authorized Github webhook request';

			beforeEach(() => {
				// Resets mockResponse spies as routeHandler is called in this beforeEach
				// and in the outer one
				express.mockResponse.send.reset();
				express.mockResponse.status.reset();
				// Sets next to a stub, so it doesn't call done twice
				next = sinon.stub();
			});

			describe('invalid user agent', () => {
				beforeEach(() => {
					request.headers['user-agent'] = 'Test';

					releaseRoute.routeHandler(request, response, next);
				});

				it('should respond with an error', () => {
					assert.calledOnce(express.mockResponse.send);
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.send, errorMessage);
					assert.calledWithExactly(express.mockResponse.status, 403);
				});
			});

			describe('invalid Github event', () => {
				beforeEach(() => {
					request.headers['x-github-event'] = 'Test';

					releaseRoute.routeHandler(request, response, next);
				});

				it('should respond with an error', () => {
					assert.calledOnce(express.mockResponse.send);
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.send, errorMessage);
					assert.calledWithExactly(express.mockResponse.status, 403);
				});
			});

			describe('invalid signature', () => {
				beforeEach(() => {
					request.headers['x-hub-signature'] = 'Test';

					releaseRoute.routeHandler(request, response, next);
				});

				it('should respond with an error', () => {
					assert.calledOnce(express.mockResponse.send);
					assert.calledOnce(express.mockResponse.status);
					assert.calledWithExactly(express.mockResponse.send, errorMessage);
					assert.calledWithExactly(express.mockResponse.status, 403);
				});
			});
		});
	});

	describe('generateSignature', () => {
		const content = '';
		let signature;

		beforeEach(() => {
			signature = releaseRoute.generateSignature(content);
		});

		it('should do a sha1 Hmac digest based on the GITHUB_SECRET env variable', () => {
			assert.equal(signature, 'e88125c451a570f92d76a5ba59574909078c2ed5');
		});
	});
});
