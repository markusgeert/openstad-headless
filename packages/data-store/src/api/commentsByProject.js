export default {
	fetch: async function ({ projectId, sentiment }) {
		const url = `/api/project/${projectId}/comment?sentiment=${sentiment}`;
		return this.fetch(url);
	},
};
