const db = require("../src/db").sequelize;

module.exports = {
	up: () => {
		try {
			return db.query(`
        RENAME TABLE ideas TO resources;
`);
		} catch (e) {
			return true;
		}
	},
};
