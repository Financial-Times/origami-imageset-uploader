'use strict';

const express = require('@financial-times/n-express');
const bodyParser = require('body-parser');

const releaseRoute = require('./release-route');

function ImagesetUploader() {
	const app = express();
	app.port = process.env.PORT || 8080;

	app.get('/', bodyParser.json(), (request, response) => {
		response.send(releaseRoute.generateSignature(request.body));
	});

	app.post('/release', bodyParser.json(), releaseRoute.routeHandler);

	return app.listen(app.port).then(server => {
		app.server = server;
		return app;
	});
}

module.exports = ImagesetUploader;
