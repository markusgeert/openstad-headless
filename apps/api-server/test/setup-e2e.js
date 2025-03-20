// Jest bug in combination with mysql2
require("iconv-lite").encodingExists("cesu8");
const Sequelize = require("sequelize");
//overwrite test database
process.env.NODE_CONFIG = '{"database":{"database":"openstad-api-tests"}}';

beforeAll(async () => {
	console.log("Resetting the database");
	return await resetDatabase();
});

const resetDatabase = async () => {
	const config = require("config");

	process.env.DEBUG = config.logging;

	const datafile = process.env.NODE_ENV || "development";

	const db = require("../src/db");
	const dbConfig = config.get("database");

	const sequelize = new Sequelize("", dbConfig.user, dbConfig.password, {
		dialect: "mysql",
	});
	//create testdatbase if not exists
	await sequelize.query("CREATE DATABASE IF NOT EXISTS `openstad-api-tests`");

	await db.sequelize.sync({ force: true });

	return await require(`../fixtures/${datafile}`)(db);
};
