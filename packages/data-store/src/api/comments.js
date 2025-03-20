export default {
	fetch: async function ({
		projectId,
		resourceId,
		sentiment,
		onlyIncludeTagIds,
	}) {
		let url = `/api/project/${projectId}/resource/${resourceId}/comment?sentiment=${sentiment}&includeUser=1&includeUserVote=1&includeVoteCount=1&includeRepliesOnComments=1`;

		onlyIncludeTagIds = onlyIncludeTagIds || "";
		url += `&onlyIncludeTagIds=${onlyIncludeTagIds}`;

		if (!projectId || !resourceId) {
			throw new Error(`No ${projectId ? "projectId" : "resourceId"} given`);
		}
		return this.fetch(url);
	},

	create: async function ({ projectId, resourceId }, data) {
		const url = `/api/project/${projectId}/resource/${resourceId}/comment`;
		const method = "post";
		delete data.id;
		const body = JSON.stringify(data);

		const newData = await this.fetch(url, { method, body });
		return newData;
	},

	update: async function ({ projectId, resourceId }, data) {
		const url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}`;
		const method = "put";
		const body = JSON.stringify(data);

		const newData = await this.fetch(url, { method, body });
		return newData;
	},

	delete: async function ({ projectId, resourceId }, data) {
		const url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}`;
		const method = "delete";

		const newData = await this.fetch(url, { method });
		return { id: data.id };
	},

	submitLike: async function ({ projectId, resourceId }, data) {
		const url = `/api/project/${projectId}/resource/${resourceId}/comment/${data.id}/vote`;
		const method = "post";
		const body = JSON.stringify({});

		const newData = await this.fetch(url, { method });
		return newData;
	},
};
