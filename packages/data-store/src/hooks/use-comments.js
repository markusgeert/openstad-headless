export default function useComments(props) {
	const projectId = props.projectId;
	const resourceId = props.resourceId;
	const sentiment = props.sentiment || null;
	const onlyIncludeTagIds = props.onlyIncludeTagIds || null;

	let dataToReturn = [];
	let errorToReturn = undefined;
	let isLoadingToReturn = false;

	if (resourceId && resourceId !== "0") {
		const { data, error, isLoading } = this.useSWR(
			{ projectId, resourceId, sentiment, onlyIncludeTagIds },
			"comments.fetch",
		);

		dataToReturn = data;
		errorToReturn = error;
		isLoadingToReturn = isLoading;
	}

	// add functionality
	const comments = dataToReturn || [];
	comments.create = (newData) =>
		this.mutate(
			{ projectId, resourceId, sentiment },
			"comments.create",
			newData,
			{ action: "create" },
		);
	comments.map(async (comment) => {
		comment.update = (newData) =>
			this.mutate(
				{ projectId, resourceId, sentiment },
				"comments.update",
				newData,
				{ action: "update" },
			);
		comment.delete = (newData) =>
			this.mutate(
				{ projectId, resourceId, sentiment },
				"comments.delete",
				comment,
				{ action: "delete" },
			);
		comment.submitLike = () =>
			this.mutate(
				{ projectId, resourceId, sentiment },
				"comments.submitLike",
				comment,
				{ action: "update" },
			);
		comment.replies?.map(async (reply) => {
			reply.update = (newData) =>
				this.mutate(
					{ projectId, resourceId, sentiment },
					"comments.update",
					newData,
					{ action: "update" },
				);
			reply.delete = (newData) =>
				this.mutate(
					{ projectId, resourceId, sentiment },
					"comments.delete",
					reply,
					{ action: "delete" },
				);
			reply.submitLike = () =>
				this.mutate(
					{ projectId, resourceId, sentiment },
					"comments.submitLike",
					reply,
					{ action: "update" },
				);
		});
	});

	return {
		data: comments,
		error: errorToReturn,
		isLoading: isLoadingToReturn,
	};
}
