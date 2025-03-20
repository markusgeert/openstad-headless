const config = require("config");
const dbConfig = config.get("database");
const mysql = require("mysql2");
const express = require("express");
const createError = require("http-errors");

const pool = mysql.createPool({
	host: dbConfig.host,
	user: dbConfig.user,
	password: dbConfig.password,
	database: dbConfig.database,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

const router = express.Router({ mergeParams: true });

// for all get requests
router.all("*", (req, res, next) => next());

router
	.route("/total")

	// count comments
	// ---------------
	.get((req, res, next) => {
		const resourceId = req.query.resourceId;
		const sentiment = req.query.sentiment;

		let query =
			"SELECT count(comments.id) AS counted FROM resources LEFT JOIN comments ON comments.resourceId = resources.id ";
		const bindvars = [];
		if (sentiment) {
			query += "AND comments.sentiment = ? ";
			bindvars.push(sentiment);
		}
		query += "WHERE resources.deletedAt IS NULL AND resources.projectId = ? ";
		bindvars.push(req.params.projectId);
		if (resourceId) {
			query += "AND resources.id = ? ";
			bindvars.push(resourceId);
		}

		pool
			.promise()
			.query(query, bindvars)
			.then(([rows, fields]) => {
				const counted = rows?.[0]?.counted || -1;
				res.json({ count: counted });
			})
			.catch((err) => {
				next(err);
			});
	});

module.exports = router;
