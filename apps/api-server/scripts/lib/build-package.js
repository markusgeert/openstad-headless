const { execSync, exec } = require("node:child_process");
const getHeadlessDependencyTree = require("../get-headless-dependency-tree");

async function getDependencyPackages() {
	// Get headless dependency tree
	const dependencyTree = await getHeadlessDependencyTree();

	// List of packages on which other packages depend (e.g. `ui` or `lib`)
	return Object.keys(dependencyTree).filter(
		(key) =>
			Array.isArray(dependencyTree[key]) && dependencyTree[key].length > 0,
	);
}

function buildPackage(pkg) {
	const getWidgetSettings = require("../../src/routes/widget/widget-settings");
	const widgetDefinitions = getWidgetSettings();

	if (!widgetDefinitions[pkg].directory) {
		console.log(`No directory found for package ${pkg}, skipping...`);
		return;
	}

	const packagePath = widgetDefinitions[pkg].directory;

	buildPackageByDirectory(packagePath);
}

function buildPackageByDirectory(directory) {
	console.log(`Building package in path: ${directory}`);

	execSync(`npm i --prefix=packages/${directory}`, { cwd: "../../" });
	execSync(`npm run build --if-present --prefix=packages/${directory}`, {
		cwd: "../../",
	});

	console.log(`Done building package in path: ${directory}`);
}

module.exports = {
	buildPackage,
	buildPackageByDirectory,
	getDependencyPackages,
};
