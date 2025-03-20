const log = require("debug")("app:http:activity");

module.exports = (app) => {
	app.use((req, res, next) => {
		const url = req.originalUrl;
		const method = req.method;
		const userId = req.user?.id;
		const userRole = req.user?.role;
		log(`${method} "${url}" ${userRole}(${userId})`);
		next();
	});
};
