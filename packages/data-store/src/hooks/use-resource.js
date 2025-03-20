export default function useResource(props) {
	const projectId = props.projectId;
	const resourceId = props.resourceId;
	const { data, error, isLoading } = this.useSWR(
		{ projectId, resourceId },
		"resource.fetch",
	);

	// add functionality
	const resource = data || {};
	resource.update = (newData) => {
		this.mutate({ projectId, resourceId }, "resource.update", newData, {
			action: "update",
		});
	};
	resource.delete = () => {
		this.mutate({ projectId, resourceId }, "resource.delete", resource, {
			action: "delete",
		});
	};
	resource.submitLike = (vote) => {
		this.mutate({ projectId, resourceId }, "resource.submitLike", vote, {
			action: "submitLike",
			revalidate: true,
			populateCache: false,
		});
	};

	return { data: resource, error, isLoading };
}
