const bcrypt = require("bcrypt");
const config = require("config");

module.exports = {
	bcrypt: {
		hash: (input) => {
			const cost = 10;
			const salt = bcrypt.genSaltSync(cost);
			const hash = bcrypt.hashSync(input, salt);
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
