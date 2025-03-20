export default {
	fetch: async function ({ projectId }) {
		const url = `/api/project/${projectId}/datalayer`;
		return this.fetch(url);
	},
};
