export default function useArea({ projectId, areaId }) {
	const { data, error, isLoading } = this.useSWR({ projectId }, "area.fetch");

	const area = data || [];

	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	return { data: area, error, isLoading };
}
