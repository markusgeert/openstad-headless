export default function useDatalayer({ projectId, datalayerId }) {
	const { data, error, isLoading } = this.useSWR(
		{ projectId },
		"datalayer.fetch",
	);

	const datalayer = data || [];

	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	return { data: datalayer, error, isLoading };
}
