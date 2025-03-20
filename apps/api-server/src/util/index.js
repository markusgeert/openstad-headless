const fs = require("node:fs");
const path = require("node:path");

const util = (module.exports = {
	invokeDir: (dirName, fn, ctx) => {
		dirName = util.relativePath(dirName);
		_invokeDir(dirName, fn, ctx);
	},

	relativePath: (dirName) => {
		// Is `dirName` relative?
		if (path.normalize(dirName) !== path.resolve(dirName)) {
			// make `dirName` relative to the caller.
			const callerFilename = util.stack()[2].getFileName();
			const callerPath = path.dirname(callerFilename);
			dirName = path.resolve(callerPath, dirName);
		}
		return dirName;
	},

	stack: function _stackGrabber() {
		const orig = Error.prepareStackTrace;
		Error.prepareStackTrace = (_, stack) => stack;
		const err = new Error();
		Error.captureStackTrace(err, _stackGrabber);
		const errStack = err.stack;
		Error.prepareStackTrace = orig;
		return errStack;
	},
});

function _invokeDir(dirName, fn, ctx) {
	const dir = fs.readdirSync(dirName);
	for (const fileName of dir) {
		const fullPath = path.join(dirName, fileName);
		const isDir = fs.lstatSync(fullPath).isDirectory();

		if (isDir) {
			_invokeDir(fullPath, fn, ctx);
		} else if (fileName !== "index.js" && fileName.match(/\.js$/) !== null) {
			const name = fileName.replace(/\.js$/, "");
			const module = require(fullPath);
			fn.call(ctx || module, module, name, dirName);
		}
	}
}
