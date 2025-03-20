module.exports = (db, sequelize, DataTypes) => {
	const ActionRun = sequelize.define("action_run", {
		status: {
			type: DataTypes.ENUM("running", "finished", "errored"),
			defaultValue: "running",
			allowNull: false,
		},

		message: {
			type: DataTypes.STRING(200),
			allowNull: true,
		},
	});

	ActionRun.associate = function (models) {
		this.belongsTo(models.User, { onDelete: "CASCADE" });
	};

	ActionRun.auth = ActionRun.prototype.auth = {
		listableBy: "admin",
		viewableBy: "admin",
		createableBy: ["admin"],
		updateableBy: ["admin"],
		deleteableBy: ["admin"],
		toAuthorizedJSON: (user, data) => data,
	};

	return ActionRun;
};
