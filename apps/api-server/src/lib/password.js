var bcrypt = require("bcrypt");
var config = require("config");

module.exports = {
	bcrypt: {
		hash: (input) => {
			var cost = 10;
			var salt = bcrypt.genSaltSync(cost);
			var hash = bcrypt.hashSync(input, salt);
			return {
				method: "bcrypt",
				cost: cost,
				salt: salt,
				hash: hash,
			};
		},
		compare: (input, hashObject) => bcrypt.compareSync(input, hashObject.hash),
	},
};
