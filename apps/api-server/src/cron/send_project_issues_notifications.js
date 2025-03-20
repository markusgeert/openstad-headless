const { Sequelize, Op } = require("sequelize");
const log = require("debug")("app:cron");
const config = require("config");
const db = require("../db");
const UseLock = require("../lib/use-lock");
const projectsWithIssues = require("../services/projects-with-issues");

// Purpose
// -------
// Send emails to projectmanagers just before the enddate of their project is reached
//
// Runs every day
module.exports = {
	// cronTime: '*/10 * * * * *',
	// runOnInit: true,
	cronTime: "0 15 4 * * *",
	runOnInit: false,
	onTick: UseLock.createLockedExecutable({
		name: "send-project-issues-notifications",
		task: async (next) => {
			if (
				process.env.DISABLE_PROJECT_ISSUE_WARNINGS &&
				process.env.DISABLE_PROJECT_ISSUE_WARNINGS === "true"
			)
				return;

			try {
				const notificationsToBeSent = {};

				// projects that should be ended but are not
				let result = await projectsWithIssues.shouldHaveEndedButAreNot({});
				const shouldHaveEndedButAreNot = result.rows;

				// for each project
				for (let i = 0; i < shouldHaveEndedButAreNot.length; i++) {
					const project = shouldHaveEndedButAreNot[i];
					if (!notificationsToBeSent[project.id])
						notificationsToBeSent[project.id] = { project, messages: [] };
					notificationsToBeSent[project.id].messages.push(
						`Project ${project.title} ${project.url ? ` (${project.url})` : ""} has an endDate in the past but projectHasEnded is not set.`,
					);
				}

				// projects that have ended but are not anonymized
				result = await projectsWithIssues.endedButNotAnonymized({});
				const endedButNotAnonymized = result; // result.rows;

				// for each project
				for (let i = 0; i < endedButNotAnonymized.length; i++) {
					const project = endedButNotAnonymized[i];
					if (!notificationsToBeSent[project.id])
						notificationsToBeSent[project.id] = { project, messages: [] };
					notificationsToBeSent[project.id].messages.push(
						`Project ${project.title} (${project.domain}) has ended but is not yet anonymized.`,
					);
				}

				// send notifications
				const projectIds = Object.keys(notificationsToBeSent);
				for (const projectId of projectIds) {
					const target = notificationsToBeSent[projectId];
					await db.Notification.create({
						type: "project issues warning",
						projectId,
						data: {
							messages: target.messages.map((message) => ({
								content: message,
							})),
						},
					});
				}

				return next();
			} catch (err) {
				console.log("error in send-project-issues-notifications cron");
				next(err); // let the locked function handle this
			}
		},
	}),
};
