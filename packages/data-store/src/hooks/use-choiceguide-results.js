export default function useChoiceGuideResults({ projectId, choiceGuideId }) {
	if (!choiceGuideId) {
		return { data: [], error: "No choiceGuideId given", isLoading: false };
	}

	try {
		const { data, error, isLoading } = this.useSWR(
			{ projectId, choiceGuideId },
			"choiceGuideResults.fetch",
		);

		if (error) {
			const error = new Error(error);
			const event = new window.CustomEvent("osc-error", { detail: error });
			document.dispatchEvent(event);
		}
		return { data: data || [], error, isLoading };
	} catch (e) {
		return {
			data: [],
			error:
				"Er ging iets mis bij het ophalen van de resultaten, waarschijnlijk ontbreken er een aantal rechten",
			isLoading: false,
		};
	}
}
