const _ = require("lodash");
const util = require("../util");

module.exports = function (db, sequelize, DataTypes) {
	const models = {};
	util.invokeDir(
		"./",
		(modelDef, fileName) => {
			if (models[fileName]) {
				throw Error(`Model with duplicate name: ${fileName}`);
			}
			if (typeof modelDef === "function") {
				models[fileName] = modelDef(db, sequelize, DataTypes);
			}
		},
		this,
	);

	return models;
};
