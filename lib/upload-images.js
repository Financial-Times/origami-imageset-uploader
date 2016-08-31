'use strict';

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const AWSBucket = process.env.AWS_BUCKET_NAME;
const S3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	params: {
		Bucket: AWSBucket
	}
});

function uploadImages(imagesetProperties) {
	const {dirName, pathToImages} = imagesetProperties;
	return new Promise((resolve, reject) => {
		const imagesetPath = path.resolve('tmp', process.env.DOWNLOAD_DIRECTORY, dirName, pathToImages);
		const [imagesetScheme, imagesetVersion] = dirName.split('-');

		fs.readdir(imagesetPath, (error, files) => {
			if (error) {
				reject(error);
			} else {
				const uploadPromises = [Promise.resolve()];
				for (const file of files) {
					const imageKey = path.join(imagesetScheme, imagesetVersion, file);
					const s3Params = {
						Key: imageKey,
						Body: fs.createReadStream(path.resolve(imagesetPath, file))
					};

					uploadPromises.push(S3.putObject(s3Params).promise());
				}

				Promise.all(uploadPromises)
					.then(() => {
						resolve(dirName);
					})
					.catch((err) => {
						reject(err);
					});
			}
		});
	});
}

module.exports = uploadImages;
