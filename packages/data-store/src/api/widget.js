export default {
	fetch: async function ({ projectId, widgetId }) {
		const url = `/api/project/${projectId}/widgets/${widgetId}`;
		return this.fetch(url);
	},
};
