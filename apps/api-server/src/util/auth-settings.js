const path = require("node:path");
const config = require("config");
const merge = require("merge");

const createProjectConfig = ({ project, useOnlyDefinedOnProject = false }) => {
	const defaultConfig = config?.auth || {};
	const temp = { provider: {}, adapter: {} };
	Object.keys(defaultConfig.provider).map((key) => (temp.provider[key] = {})); // todo: defaultConfig is non-extensible, that's why this very not robust fix
	const apiAuthConfig = merge.recursive(temp, defaultConfig);

	const projectSpecificConfig = project?.config?.auth || {};
	const mergedConfig = merge.recursive(
		{},
		apiAuthConfig,
		projectSpecificConfig,
	);

	if (useOnlyDefinedOnProject) {
		// use only providers that are configured on the project, but fallback on defaults if nothing is defined on the project
		const projectProviders = Object.keys(projectSpecificConfig.provider || {});
		if (projectProviders) {
			const mergedProviders = Object.keys(mergedConfig.provider || {});
			mergedProviders.map((target) => {
				if (!projectProviders.find((p) => p === target)) {
					delete mergedConfig.provider[target];
				}
			});
		}
	}

	return mergedConfig;
};

const getConfig = async ({ project, useAuth = "default" }) => {
	const projectConfig = createProjectConfig({ project });

	if (useAuth === "default" && projectConfig.default)
		useAuth = projectConfig.default;

	let authConfig = {
		provider: useAuth,
		jwtSecret: projectConfig.jwtSecret,
	};

	const providerConfig = projectConfig.provider[useAuth] || {};
	const adapterConfig = projectConfig.adapter[providerConfig.adapter] || {};
	authConfig = merge.recursive(authConfig, adapterConfig);
	authConfig = merge.recursive(authConfig, providerConfig);

	if (
		!authConfig.jwtSecret ||
		authConfig.jwtSecret === "REPLACE THIS VALUE!!"
	) {
		// todo: move this to a place where is called once, not every request
		console.log("===========================");
		console.log("jwtSecret is not configured");
		console.log("¡¡ this should be fixed !!!");
		console.log("===========================");
	}

	return authConfig;
};

const getAdapter = async ({ authConfig, project, useAuth = "default" }) => {
	authConfig = authConfig || (await getConfig({ project, useAuth }));

	try {
		const adapter = await require(
			`${path.normalize(`${__dirname}/../..`)}/${authConfig.modulePath}`,
		);
		return adapter;
	} catch (err) {
		console.log(err);
		throw new Error("Adapter not found");
	}
};

const getProviders = async ({ project, useOnlyDefinedOnProject = false }) => {
	const projectConfig = createProjectConfig({
		project,
		useOnlyDefinedOnProject,
	});
	const providers = Object.keys(projectConfig.provider);

	return providers;
};

module.exports = {
	config: getConfig,
	adapter: getAdapter,
	providers: getProviders,
};
