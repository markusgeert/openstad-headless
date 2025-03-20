export default function useResources(
	{
		projectId,
		page = 0,
		pageSize = 20,
		search = "",
		tags = [],
		sort = "random",
		statuses = [],
	},
	options,
) {
	if (!projectId) {
		const data = {
			metadata: {
				page: 0,
				pageSize: 0,
				pageCount: 1,
				totalCount: 0,
			},
			records: [],
		};

		return { data, error: "No projectId given", isLoading: false };
	}

	// If you add a prop here, the also do it for filter
	const { data, error, isLoading } = this.useSWR(
		{ projectId, page, pageSize, search, tags, sort, statuses },
		"resources.fetch",
		options,
	);

	// add functionality
	let resources = data || [];

	// Resource where probably called without page and itemsPerPage
	if (Array.isArray(resources)) {
		resources = {
			metadata: {
				page: 0,
				pageSize: resources.length,
				pageCount: 1,
				totalCount: resources.length,
			},
			records: resources,
		};
	}

	const create = (submittedData, widgetId) =>
		this.mutate(
			{ projectId },
			"resources.create",
			{ submittedData, widgetId },
			{
				action: "create",
			},
		);

	const submitVotes = (resourcesToLike) =>
		this.mutate({ projectId }, "resources.submitLike", resourcesToLike, {
			action: "update",
		});

	if (resources.records) {
		resources.records.create = (newData) =>
			this.mutate({ projectId }, "resources.create", newData, {
				action: "create",
			});

		resources.records.forEach(async (resource) => {
			resource.update = (newData) =>
				this.mutate({ projectId }, "resources.update", newData, {
					action: "update",
				});
			resource.delete = () =>
				this.mutate({ projectId }, "resources.delete", resource, {
					action: "delete",
				});
		});
	}

	return { data: resources, error, isLoading, submitVotes, create };
}
