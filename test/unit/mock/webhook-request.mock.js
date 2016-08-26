'use strict';

const body = {
	release: {
		tag_name: 'v1.0.0'
	},
	repository: {
		name: 'test',
		clone_url: 'https://test.com'
	}
};

const headers = {
	'x-hub-signature': 'sha1=148e61f31d5701d4499ec850be01512db7052729',
	'user-agent': 'GitHub-Hookshot/044aadd',
	'x-github-event': 'release'
};

module.exports = {
	body,
	headers
};
