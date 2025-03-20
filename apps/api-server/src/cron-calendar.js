const config = require("config");
const CronJob = require("cron").CronJob;
const extend = require("lodash/extend");
const util = require("./util");

module.exports = {
	jobs: new Map(),

	start: function () {
		const jobs = this.jobs;
		util.invokeDir("./cron", (jobDef, fileName) => {
			try {
				const job = new CronJob(
					extend({}, jobDef, {
						timeZone: config.get("timeZone"),
						start: true,
					}),
				);
				jobs.set(fileName, job);
			} catch (e) {
				throw new Error(`Invalid cron: ${e.message}`);
			}
		});
		return this;
	},
	stop: function () {
		for (const job of this.jobs) {
			job.stop();
		}
		return this;
	},
};
