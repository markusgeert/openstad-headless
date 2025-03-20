export default function useAreas() {
	const { data, error, isLoading } = this.useSWR({}, "areas.fetch");

	const areas = data || [];
	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	return { data: areas, error, isLoading };
}
