const sanitize = require("../util/sanitize");
const config = require("config");
const getExtraDataConfig = require("../lib/sequelize-authorization/lib/getExtraDataConfig");
const userHasRole = require("../lib/sequelize-authorization/lib/hasRole");
const seqnr = require("./lib/seqnr");

module.exports = (db, sequelize, DataTypes) => {
	const Status = sequelize.define(
		"statuses",
		{
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			name: {
				type: DataTypes.STRING,
				allowNull: false,
				set: function (text) {
					this.setDataValue("name", sanitize.title(text.trim()));
				},
			},

			seqnr: {
				type: DataTypes.INTEGER,
				allowNull: false,
				default: 10,
			},

			addToNewResources: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				default: false,
			},

			label: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			color: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			backgroundColor: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			mapIcon: {
				type: DataTypes.TEXT,
				allowNull: true,
			},

			listIcon: {
				type: DataTypes.TEXT,
				allowNull: true,
			},

			extraFunctionality: {
				type: DataTypes.JSON,
				allowNull: false,
				defaultValue: {},
			},

			extraData: getExtraDataConfig(DataTypes.JSON, "statuses"),
		},
		{
			defaultScope: {
				order: ["seqnr"],
			},

			hooks: {
				afterCreate: (instance, options) => {
					seqnr.renumber({ model: db.Status });
				},

				afterUpdate: (instance, options) => {
					seqnr.renumber({ model: db.Status });
				},
			},

			individualHooks: true,
		},
	);

	Status.scopes = function scopes() {
		return {
			forProjectId: (projectId) => ({
				where: {
					projectId: projectId,
				},
			}),

			includeProject: {
				include: [
					{
						model: db.Project,
					},
				],
			},

			onlyWithIds: (idList) => ({
				where: {
					id: idList,
				},
			}),
		};
	};

	Status.associate = function (models) {
		this.belongsToMany(models.Resource, {
			through: "resource_statuses",
			constraints: false,
		});

		this.belongsTo(models.Project, { onDelete: "CASCADE" });
	};

	Status.auth = Status.prototype.auth = {
		listableBy: "all",
		viewableBy: "all",
		createableBy: "moderator",
		updateableBy: "moderator",
		deleteableBy: "moderator",
	};

	return Status;
};
