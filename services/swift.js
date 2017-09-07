const axios = require('axios');

function getDrones() {
	const queryPromise = axios({
		url:  `https://codetest.kube.getswift.co/drones`,
		method: 'GET'
	})

	return queryPromise;
}

function getPackages() {
	const queryPromise = axios({
		url:  `https://codetest.kube.getswift.co/packages`,
		method: 'GET',
	})

	return queryPromise;
}

module.exports = { getDrones, getPackages };
