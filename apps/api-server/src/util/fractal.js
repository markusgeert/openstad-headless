const fs = require("node:fs");
const jsdom = require("jsdom");
const util = require("./");

const FractalFactory = require("../../lib/fractal/dist/fractal");
const cache = {};

module.exports = {
	getTemplate: (viewName) =>
		new Promise((resolve, reject) => {
			const cachedTpl = _getCachedTemplate(viewName);
			if (cachedTpl) {
				resolve(Object.create(cachedTpl));
			} else {
				_cacheTemplate(viewName, (cachedTpl) => {
					resolve(Object.create(cachedTpl));
				});
			}
		}),
};

function _cacheTemplate(viewName, resolve) {
	const paths = _getTemplatePaths(viewName);

	jsdom.env({
		html: fs.readFileSync(paths.html, "utf-8"),
		done: (err, window) => {
			const document = window.document;
			const Fractal = FractalFactory(window);

			Fractal.View.mixin(["variables"]);
			Fractal.scan(document.body);

			Fractal.give = function () {
				const outerHTML = document.documentElement.outerHTML;
				const output = `<!DOCTYPE html>${outerHTML.replace(/<template.*?<\/template>/g, "")}`;
				this.empty();
				return output;
			};

			require(paths.view)(Fractal);
			cache[viewName] = {
				mtime: fs.statSync(paths.html).mtime,
				template: Fractal,
			};

			resolve(Fractal);
		},
	});
}
function _getCachedTemplate(viewName) {
	const paths = _getTemplatePaths(viewName);
	const cachedTpl = cache[viewName];
	const stat = fs.statSync(paths.html);

	if (cachedTpl && stat.mtime === cachedTpl.mtime) {
		return cachedTpl.template;
	}
	return null;
}

function _getTemplatePaths(viewName) {
	return {
		html: util.relativePath(`../../html/${viewName}.html`),
		view: util.relativePath(`../views/${viewName}`),
	};
}
