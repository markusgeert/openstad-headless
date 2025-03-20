const db = require("../src/db").sequelize;

module.exports = {
	up: () => {
		try {
			return db.query(`
        ALTER TABLE comments CHANGE ideaId resourceId INT(11) NOT NULL DEFAULT '0'; 
`);
		} catch (e) {
			return true;
		}
	},
};
