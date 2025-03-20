const { DataTypes } = require("sequelize");

module.exports = (db, sequelize, Sequelize) => {
	const UserRole = sequelize.define(
		"user_role",
		{
			clientId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			roleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: "user_roles",
			defaultScope: {
				include: db.Role,
			},
		},
	);

	UserRole.associate = function (models) {
		this.belongsTo(db.Client);
		this.belongsTo(db.User);
		this.belongsTo(db.Role);
	};

	UserRole.scopes = function scopes() {
		return {
			includeRole: () => ({
				include: [
					{
						model: db.Role,
					},
				],
			}),
			includeUser: () => ({
				include: [
					{
						model: db.User,
					},
				],
			}),
			includeClient: () => ({
				include: [
					{
						model: db.Client,
					},
				],
			}),
		};
	};

	return UserRole;
};
