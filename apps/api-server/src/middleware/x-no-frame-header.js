const config = require("config");
const db = require("../db");

module.exports = (app) => {
	app.use((req, res, next) => {
		res.set({
			"X-Frame-Options": "deny",
		});
		next();
	});
};
