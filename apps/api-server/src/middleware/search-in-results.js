const config = require("config");

module.exports =
	({ searchfields = ["title", "summary", "description"] }) =>
	(req, res, next) => {
		let search = req.query.search;

		// if no search query exists move on
		if (!search) return next();

		const list = req.results;

		// if results is not defined something weird happened
		if (typeof list === "undefined")
			return next("No results defined to search in");

		const results = [];

		if (!Array.isArray(search)) search = [search];
		search.forEach((criterium) => {
			const key = Object.keys(criterium)[0];
			const value = criterium[key].toLowerCase(); // Converteer naar lowercase voor case-insensitieve vergelijking

			let useSearchFields;
			if (key === "text") {
				useSearchFields = searchfields;
			} else {
				useSearchFields = searchfields.filter((field) => field === key);
			}

			const searchTerms = value.split(" ");

			const searchResult = list.filter((item) => {
				return searchTerms.every((term) => {
					return useSearchFields.some((field) => {
						return item[field]?.toLowerCase().includes(term);
					});
				});
			});

			results.push(...searchResult);
		});

		const merged = Array.from(new Set(results));

		req.results = merged;

		return next();
	};
