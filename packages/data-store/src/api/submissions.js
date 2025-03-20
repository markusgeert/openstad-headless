export default {
	fetch: async ({ projectId }) => [],

	create: async function ({ projectId }, data) {
		delete data.id;

		const url = `/api/project/${projectId}/submission`;
		const method = "post";
		const body = JSON.stringify(data);

		const newData = await this.fetch(url, { method, body });
		return newData;
	},
};
