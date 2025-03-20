const fetch = require("node-fetch");
const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL;

const fetchAll = async () => {
	try {
		const uri = `${apiUrl}/api/project?includeConfig=1`;
		const response = await fetch(uri, {
			headers: {
				Accept: "application/json",
				"Cache-Control": "no-cache",
				Authorization: process.env.API_KEY,
			},
		});
		if (!response.ok) {
			console.log(response);
			throw new Error("Fetch failed");
		}
		return await response.json();
	} catch (err) {
		console.log(err);
	}
};

const fetchOne = async (projectId) => {
	try {
		const uri = `${apiUrl}/api/project/${projectId}?includeConfig=1`;
		const response = await fetch(uri, {
			headers: {
				Accept: "application/json",
				"Cache-Control": "no-cache",
				Authorization: process.env.API_KEY,
			},
		});
		if (!response.ok) {
			console.log(response);
			throw new Error("Fetch failed");
		}
		return await response.json();
	} catch (err) {
		console.log(err);
	}
};

module.exports = {
	fetchAll,
	fetchOne,
};
