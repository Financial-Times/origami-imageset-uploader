'use strict';

function getMajorVersion(tag) {
	// Matches strings that may start with a 'v'
	// are then followed by digits and then a '.'
	// and captures just the digits to extract
	// the major version
	const regex = /^v?(\d+)\./;

	const matchedTag = tag.match(regex);
	if (matchedTag) {
		// Capture group is in position 1
		return matchedTag[1];
	} else {
		return undefined;
	}
}

module.exports = getMajorVersion;
