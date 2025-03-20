export default function useCommentsByProject(props) {
	const projectId = props.projectId;
	const sentiment = props.sentiment;

	const { data, error, isLoading } = this.useSWR(
		{ projectId, sentiment },
		"commentsByProject.fetch",
	);

	const comments = data || [];

	if (error) {
		const error = new Error(error);
		const event = new window.CustomEvent("osc-error", { detail: error });
		document.dispatchEvent(event);
	}

	return { data: comments, error, isLoading };
}
