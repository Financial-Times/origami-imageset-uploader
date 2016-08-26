'use strict';

const path = require('path');

const denodeify = require('denodeify');
const exec = denodeify(require('child_process').exec, (err, stdout, stderr) => {
  return [err, [stdout, stderr]];
});

const getMajorVersion = require('./get-major-version');
const imagesetMap = require('./../imageset-map.json');
const downloadDirectory = process.env.DOWNLOAD_DIRECTORY;

function fetchImages(release) {
	return new Promise((resolve, reject) => {
		if (!imagesetMap[release.name]) {
			reject(new Error('Non valid imageset'));
		}

		const majorVersion = getMajorVersion(release.tag);
		const dirName = `${imagesetMap[release.name].scheme}-${majorVersion}`;
		const pathToImages = imagesetMap[release.name].pathToImages;

		const imagesetPath = path.resolve('tmp', downloadDirectory, dirName);
		const cwd = process.cwd();

		const commandList = [
			// Creates the directory
			() => exec(`git init ${imagesetPath}`),
			() => Promise.resolve(process.chdir(path.resolve(cwd, imagesetPath))),
			() => exec(`git remote add origin ${release.url}`),
			// Sparse checkout so it only pulls in the images
			() => exec(`git config core.sparsecheckout true`),
			// Tells git which directory holds the images
			() => exec(`echo "${pathToImages}/*" >> .git/info/sparse-checkout`),
			() => exec(`git pull --depth=1 origin master`),
			() => Promise.resolve(process.chdir(cwd))
		];

		// Runs each command one after the other
		const commandPromises = commandList.reduce((promise, command) => {
			return promise.then(() => {
				return command();
			}, reject);
		}, Promise.resolve());

		// Resolves this step after all commands have been executed
		commandPromises.then(() => {
			resolve({
				dirName,
				pathToImages
			});
		}).catch((error) => {
			reject(error);
		});
	});
}

module.exports = fetchImages;
