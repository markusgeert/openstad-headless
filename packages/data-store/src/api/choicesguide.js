export default {
	fetch: async ({ projectId }) => [],

	create: async function ({ projectId }, data) {
		delete data.id;

		const url = `/api/project/${projectId}/choicesguide`;
		const method = "POST";

		const body = JSON.stringify(data);

		return await this.fetch(url, { method, body });
	},
};
