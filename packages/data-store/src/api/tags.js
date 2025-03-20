export default {
	fetch: async function ({ projectId, type, onlyIncludeIds = [] }) {
		const params = new URLSearchParams();
		if (onlyIncludeIds.length > 0) {
			onlyIncludeIds.forEach((tagId) => params.append("tags", tagId));
		}
		const url = `/api/project/${projectId}/tag?type=${type}&${params.toString()}`;
		return this.fetch(url);
	},

	create: async function ({ projectId, type }, data) {
		const url = `/api/project/${projectId}/tag`;
		const method = "post";
		delete data.id;
		const body = JSON.stringify(data);
		const newData = await this.fetch(url, { method, body });
		return newData;
	},

	update: async function ({ projectId, type }, data) {
		const url = `/api/project/${projectId}/tag/${data.id}`;
		const method = "put";
		const body = JSON.stringify(data);
		const newData = await this.fetch(url, { method, body });
		return newData;
	},

	delete: async function ({ projectId, type }, data) {
		const url = `/api/project/${projectId}/tag/${data.id}`;
		const method = "delete";
		const newData = await this.fetch(url, { method });
		return { id: data.id };
	},
};
