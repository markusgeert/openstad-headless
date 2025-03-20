const fetch = require("node-fetch");
const mapUserData = require("../../util/map-user-data");

const service = {};

service.fetchUserData = async function fetchUserData({
	authConfig,
	accessToken,
}) {
	let url = authConfig.serverUrl + authConfig.serverUserInfoPath;
	url = url.replace(/\[\[clientId\]\]/, authConfig.clientId);

	try {
		const response = await fetch(url, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (!response.ok) {
			console.log(response);
			throw new Error("Fetch failed");
		}

		const userData = await response.json();

		const mappedUserData = mapUserData({
			map: authConfig.userMapping,
			user: { ...userData, accessToken },
		});
		mappedUserData.idpUser.provider = authConfig.provider;
		return mappedUserData;
	} catch (err) {
		console.log(err);
		throw new Error("Cannot connect to auth server");
	}
};

module.exports = service;
