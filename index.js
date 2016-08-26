'use strict';

const imagesetUploader = require('./lib/imageset-uploader.js');

imagesetUploader()
	.then((app) => {
		console.log(`Listening on port ${app.port}`);
	})
	.catch((e) => {
		console.log(e.stack);
		process.exit(1);
	});
