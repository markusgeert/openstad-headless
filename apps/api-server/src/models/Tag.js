const sanitize = require("../util/sanitize");
const config = require("config");
const getExtraDataConfig = require("../lib/sequelize-authorization/lib/getExtraDataConfig");
const userHasRole = require("../lib/sequelize-authorization/lib/hasRole");
const seqnr = require("./lib/seqnr");

module.exports = (db, sequelize, DataTypes) => {
	const Tag = sequelize.define(
		"tag",
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

			type: {
				type: DataTypes.STRING,
				allowNull: true,
				set: function (text) {
					this.setDataValue(
						"type",
						text ? sanitize.safeTags(text.trim()) : null,
					);
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

			extraData: getExtraDataConfig(DataTypes.JSON, "tags"),

			useDifferentSubmitAddress: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				default: false,
			},

			newSubmitAddress: {
				type: DataTypes.TEXT,
				allowNull: true,
			},

			defaultResourceImage: {
				type: DataTypes.TEXT,
				allowNull: true,
			},

			documentMapIconColor: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			defaultScope: {
				order: ["seqnr"],
			},

			hooks: {
				afterCreate: (instance, options) => {
					seqnr.renumber({ model: db.Tag, where: { type: instance.type } });
				},

				afterUpdate: (instance, options) => {
					seqnr.renumber({ model: db.Tag, where: { type: instance.type } });
				},
			},

			individualHooks: true,
		},
	);

	Tag.scopes = function scopes() {
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

			selectType: (type) => ({
				where: {
					type: type,
				},
			}),

			onlyWithIds: (idList) => ({
				where: {
					id: idList,
				},
			}),
		};
	};

	Tag.associate = function (models) {
		this.belongsToMany(models.Resource, {
			through: "resource_tags",
			constraints: false,
		});

		this.belongsToMany(models.Comment, {
			through: "comment_tags",
			as: "comments",
			foreignKey: "tagId",
			otherKey: "commentId",
			constraints: false,
		});

		this.belongsTo(models.Project, { onDelete: "CASCADE" });
	};

	// dit is hoe het momenteel werkt; ik denk niet dat dat de bedoeling is, maar ik volg nu
	Tag.auth = Tag.prototype.auth = {
		listableBy: "all",
		viewableBy: "all",
		createableBy: "moderator",
		updateableBy: "moderator",
		deleteableBy: "moderator",
	};

	return Tag;
};
