const dateFilter = require("./dateFilter");

function replaceResourceVariables(text, resource) {
	const variables = [
		{
			key: "%meeting%",
			value:
				resource?.agendas && resource.agendas.length > 0
					? dateFilter(resource.agendas[0].start_date, "dddd D MMM, YYYY")
					: "",
		},
		{
			key: "%explanation_approved%",
			value: resource?.info?.explanation_budget_approval
				? resource.info.explanation_budget_approval
				: "",
		},
		{
			key: "%explanation_declined%",
			value: resource?.info?.explanation_budget_rejection
				? resource.info.explanation_budget_rejection
				: "",
		},
	];

	variables.forEach((variable) => {
		text = text.replace(variable.key, variable.value);
	});

	return text;
}

module.exports = replaceResourceVariables;
