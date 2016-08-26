'use strict';

const path = require('path');
const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');
const getMajorVersion = require('./../../../lib/get-major-version');

describe('lib/fetch-images', () => {
	let fetchImages;
	let child_process;
	let release;
	let imagesetMap;

	beforeEach(() => {
		process.env.DOWNLOAD_DIRECTORY = 'imagesets';
		child_process = require('../mock/child_process.mock.js');
		mockery.registerMock('child_process', child_process);
		imagesetMap = require('../mock/imageset-map.mock');
		mockery.registerMock('./../imageset-map.json', imagesetMap);
		release = require('../mock/release.mock');
		fetchImages = require('./../../../lib/fetch-images');
	});

	it('exports a function', () => {
		assert.isFunction(fetchImages);
	});

	describe('fetchImages', () => {
		let dir;
		let fetchedImages;

		beforeEach(() => {
			process.chdir = sinon.stub();
			dir = path.resolve('tmp', 'imagesets', `${imagesetMap[release.name].scheme}-${getMajorVersion(release.tag)}`);
			fetchedImages = fetchImages(release);
		});

		it('should return a Promise', () => {
			assert.instanceOf(fetchedImages, Promise);
		});

		describe('then()', () => {
			let imagesetProperties;

			beforeEach((done) => {
				fetchedImages.then((imagesetProps) => {
					imagesetProperties = imagesetProps;
					done();
				});
			});

			it('resolves with imageset properties', () => {
				assert.deepEqual(imagesetProperties, {
					dirName: `${imagesetMap[release.name].scheme}-${getMajorVersion(release.tag)}`,
					pathToImages: `${imagesetMap[release.name].pathToImages}`
				});
			});

			it('instantiates git repo', () => {
				assert.called(child_process.exec);
				assert.calledWith(child_process.exec, `git init ${dir}`);
			});

			it('moves into the new directory', () => {
				assert.called(process.chdir);
				assert.calledWith(process.chdir, path.resolve(process.cwd(), dir));
			});

			it('adds origin from release data', () => {
				assert.called(child_process.exec);
				assert.calledWith(child_process.exec, `git remote add origin ${release.url}`);
			});

			it('configures sparse checkout', () => {
				assert.called(child_process.exec);
				assert.calledWith(child_process.exec, `git config core.sparsecheckout true`);
			});

			it('configures directory that will be pulled', () => {
				assert.called(child_process.exec);
				assert.calledWith(child_process.exec, `echo "${imagesetMap[release.name].pathToImages}/*" >> .git/info/sparse-checkout`);
			});

			it('pulls in images', () => {
				assert.called(child_process.exec);
				assert.calledWith(child_process.exec, `git pull --depth=1 origin master`);
			});

			it('moves back to root directory', () => {
				assert.called(process.chdir);
				assert.calledWith(process.chdir, process.cwd());
			});
		});
	});
});
