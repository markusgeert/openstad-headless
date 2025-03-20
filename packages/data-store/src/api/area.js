export default {
	fetch: async function ({ projectId }) {
		const url = `/api/project/${projectId}/area`;
		return this.fetch(url);
	},
};
