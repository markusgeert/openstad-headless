const { Sequelize } = require("sequelize");
const db = require("../src/db");

module.exports = {
	async up({ context: queryInterface }) {
		try {
			const projects = await db.Project.findAll();
			for (const project of projects) {
				const defaultStatusIds =
					project.config?.resources?.defaultStatusIds || [];
				const statuses = await db.Status.findAll({
					where: { id: defaultStatusIds },
				});

				for (const status of statuses) {
					await status.update({ addToNewResources: true });
				}

				const defaultTagIds = project.config?.resources?.defaultTagIds || [];
				const tags = await db.Tag.findAll({ where: { id: defaultTagIds } });

				for (const tag of tags) {
					await tag.update({ addToNewResources: true });
				}

				project.update({
					config: {
						resources: { defaultStatusIds: null, defaultTagIds: null },
					},
				});
			}
		} catch (err) {
			console.log(err);
			process.exit();
		}
	},

	async down({ context: queryInterface }) {
		console.log("Sorry, default tags and status down is not implemented");
	},
};
