const db = require("../db");

exports.getUserByClientAndRoles = (email, clientId, roles) =>
	db.User.findOne({ where: { email } }).then((user) => {
		return user
			.getRoleForClient(clientId)
			.then((userrole) =>
				roles.find((role) => role.name === userrole.name) ? user : undefined,
			);
	});
