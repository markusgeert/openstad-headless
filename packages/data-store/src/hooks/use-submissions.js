export default function useSubmissions({ projectId }) {
	const { data, error, isLoading } = this.useSWR(
		{ projectId },
		"submissions.fetch",
	);

	const submissions = data || [];

	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	const create = (submittedData, widgetId) =>
		this.mutate(
			{ projectId },
			"submissions.create",
			{ submittedData, widgetId },
			{
				action: "create",
			},
		);

	return { data: submissions, error, isLoading, create };
}
