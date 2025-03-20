export default function useUserActivity({ projectId, userId }) {
	const { data, error, isLoading } = this.useSWR(
		{
			projectId,
			userId,
		},
		"userActivity.fetch",
	);

	const activities = data || [];

	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	return { data: activities, error, isLoading };
}
