'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const fetchImages = require('./fetch-images');
const uploadImages = require('./upload-images');

function generateSignature(payload) {
	const githubSecretHash = crypto.createHmac('sha1', process.env.GITHUB_SECRET);
	githubSecretHash.update(JSON.stringify(payload));
	return githubSecretHash.digest('hex');
}

function releaseRoute(request, response, next) {
	// removes "sha1=" bit of the header
	const signatureEqualsChar = request.headers['x-hub-signature'].indexOf('=') || 0;
	const requestSignature = signatureEqualsChar ?
								request.headers['x-hub-signature'].substr(signatureEqualsChar + 1) :
								request.headers['x-hub-signature'];

	// Checks it's a Github webhook
	// That it's a release event
	// That it comes from the imageset uploader webhook
	if (request.headers['user-agent'].includes('GitHub-Hookshot') &&
		request.headers['x-github-event'] === 'release' &&
		requestSignature === generateSignature(request.body)) {

		fetchImages({
			name: request.body.repository.name,
			url: request.body.repository.clone_url,
			tag: request.body.release.tag_name
		})
		.then(uploadImages)
		.then((dir) => {
			return new Promise((resolve, reject) => {
				if (!dir) {
					reject('Couldn\'t upload imageset to S3');
				}

				const dirPath = path.resolve(process.env.DOWNLOAD_DIRECTORY, dir);
				fs.rmdir(dirPath, (e) => {
					if (e) {
						reject(e);
					}

					resolve();
				});
			});
		})
		.then(() => {
			response.status(200);
			response.send('OK');
			next();
		})
		.catch((error) => {
			response.status(500);
			response.send(error);
			next();
		});
	} else {
		response.status(403);
		response.send('Needs to be an authorized Github webhook request');
		next();
	}
}

module.exports = {
	routeHandler: releaseRoute,
	generateSignature
};
