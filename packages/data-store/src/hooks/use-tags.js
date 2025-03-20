export default function useTags(props) {
	const projectId = props.projectId;
	const type = props.type;
	const onlyIncludeIds = props.onlyIncludeIds;

	const { data, error, isLoading } = this.useSWR(
		{ projectId: projectId || this.projectId, type, onlyIncludeIds },
		"tags.fetch",
	);

	// add functionality
	const tags = data || [];
	tags.create = (newData) =>
		this.mutate({ projectId, type }, "tags.create", newData, {
			action: "create",
		});
	tags.map(async (tag) => {
		tag.update = (newData) =>
			this.mutate({ projectId, type }, "tags.update", newData, {
				action: "update",
			});
		tag.delete = (newData) =>
			this.mutate({ projectId, type }, "tags.delete", tag, {
				action: "delete",
			});
		tag.submitLike = () =>
			this.mutate({ projectId, type }, "tags.submitLike", tag, {
				action: "update",
			});
	});

	if (error) {
		const event = new window.CustomEvent("osc-error", {
			detail: new Error(error),
		});
		document.dispatchEvent(event);
	}

	return { data: tags, error, isLoading };
}
