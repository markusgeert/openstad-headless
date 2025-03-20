const db = require("../db");

module.exports = async function processQueuedNotifications() {
	try {
		const queuedNotifications = await db.Notification.scope().findAll({
			where: { status: "queued" },
		});

		// aggregate per project, type, from, to
		const targets = {};
		queuedNotifications.forEach((notification) => {
			const projectId = notification.projectId;
			if (!targets[projectId]) targets[projectId] = {};
			const type = notification.type;
			if (!targets[projectId][type]) targets[projectId][type] = {};
			const from = notification.from;
			if (!targets[projectId][type][from]) targets[projectId][type][from] = {};
			const to = notification.to;
			if (!targets[projectId][type][from][to])
				targets[projectId][type][from][to] = [];
			targets[projectId][type][from][to].push(notification);
		});

		// foreach target
		const projectIds = Object.keys(targets);
		for (const projectId of projectIds) {
			const types = Object.keys(targets[projectId]);
			for (const type of types) {
				const froms = Object.keys(targets[projectId][type]);
				for (const from of froms) {
					const tos = Object.keys(targets[projectId][type][froms]);
					for (const to of tos) {
						// target is now an array of notifications
						const target = targets[projectId][type][from][to];
						// merge data
						const data = {};
						target.forEach((entry) => {
							Object.keys(entry.data).map((key) => {
								if (!data[key]) data[key] = [];
								if (!data[key].find((d) => d === entry.data[key]))
									data[key].push(entry.data[key]);
							});
						});

						const instance = target[0]; // ignore other multiple fields like subject

						const message = await db.NotificationMessage.create(
							{
								projectId: instance.projectId,
								engine: instance.engine,
								type: instance.type,
								from: instance.from,
								to: instance.to,
							},
							{
								data,
							},
						);
						await message.send();
						await instance.update({ status: "sent" });
						for (const entry of target) {
							await entry.update({ status: "sent" });
						}
					}
				}
			}
		}
	} catch (err) {
		console.log("Error: Send queued NotificationMessages failed");
		console.log(err);
	}
};
