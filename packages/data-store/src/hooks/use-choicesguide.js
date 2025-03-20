export default function useChoicesguide({ projectId }) {
	const { data, error, isLoading } = this.useSWR(
		{ projectId },
		"choicesguide.fetch",
	);

	const choiceguides = data || [];

	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	const create = (submittedData, widgetId) =>
		this.mutate(
			{ projectId },
			"choicesguide.create",
			{ submittedData, projectId, widgetId },
			{
				action: "create",
			},
		);

	return { data: choiceguides, error, isLoading, create };
}
