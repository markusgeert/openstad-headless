const db = require("../db").sequelize;

module.exports = {
	up: () => {
		try {
			return db.query(`
        ALTER TABLE users DROP firstName;
      `);
		} catch (e) {
			return true;
		}
	},
};
