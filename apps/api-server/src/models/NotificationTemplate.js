const merge = require("merge");

module.exports = (db, sequelize, DataTypes) => {
	const NotificationTemplate = sequelize.define(
		"notification_template",
		{
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			engine: {
				type: DataTypes.ENUM("email", "sms", "carrier pigeon"),
				allowNull: false,
				default: "email",
			},

			type: {
				type: DataTypes.STRING,
				allowNull: true,
			},

			label: {
				type: DataTypes.STRING,
				allowNull: false,
			},

			subject: {
				type: DataTypes.STRING,
				allowNull: true,
				default: "",
			},

			body: {
				type: DataTypes.TEXT,
				allowNull: true,
				default: "",
			},
		},
		{
			hooks: {
				afterCreate: async (instance, options) => {
					await updateAuthClient(instance, options);
				},

				afterUpdate: async (instance, options) => {
					await updateAuthClient(instance, options);
				},
			},
		},
	);

	NotificationTemplate.auth = NotificationTemplate.prototype.auth = {
		listableBy: "admin",
		viewableBy: "admin",
		createableBy: "admin",
		updateableBy: "admin",
		deleteableBy: "admin",
	};

	NotificationTemplate.associate = function (models) {
		this.belongsTo(models.Project, { onDelete: "CASCADE" });
	};

	return NotificationTemplate;

	// temp solution: the auth serrver should use this notification service (https://github.com/openstad/openstad-headless/issues/256) but until then auth templates are updated here
	async function updateAuthClient(instance, options) {
		if (instance.type !== "login email") return;

		let project;
		if (instance.projectId) {
			project = await db.Project.findByPk(instance.projectId);
		}

		if (project) {
			const authSettings = require("../util/auth-settings");
			const providers = await authSettings.providers({ project });
			for (const provider of providers) {
				const authConfig = await authSettings.config({
					project,
					useAuth: provider,
				});
				const newConfig = {
					config: {
						Url: {
							emailSubject: instance.subject.replace(
								/\{\{\project.name}\}/,
								project.name,
							),
							emailTemplate: instance.body.replace(
								/\{\{\project.name}\}/,
								project.name,
							),
						},
					},
				};
				const adapter = await authSettings.adapter({ authConfig });
				if (adapter.service.updateClient) {
					const merged = merge.recursive({}, authConfig, newConfig);
					await adapter.service.updateClient({ authConfig: merged, project });
				}
			}
		}
	}
};
