export default function useWidget({ projectId, widgetId }) {
	const { data, error, isLoading } = this.useSWR(
		{ projectId, widgetId },
		"widget.fetch",
	);

	const widget = data || [];

	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	return { data: widget, error, isLoading };
}
