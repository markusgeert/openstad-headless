const db = require("../db");

const useLock = {};

useLock.executeLockedFunction = async ({ name, task }) => {
	let lock;
	try {
		// create lock
		lock = await db.Lock.findOne({ where: { type: name } });
		if (lock) {
			return console.log(`LOCKED FUNCTION NOT RUNNING: ${name} is locked`);
		}
		lock = await db.Lock.create({ type: name });

		// execute task
		const error = await new Promise(task);
		if (error) throw error;

		await lock.destroy();
	} catch (err) {
		if (lock) {
			await lock.destroy();
		}

		if (err.name === "SequelizeUniqueConstraintError") {
			return console.log(`LOCKED FUNCTION NOT RUNNING: ${name} is locked`);
		}
		return console.log(`LOCKED FUNCTION FAILED: ${name}`);
		console.log(err);
	}
};

useLock.createLockedExecutable =
	({ name, task }) =>
	async () =>
		useLock.executeLockedFunction({ name, task });

module.exports = exports = useLock;
