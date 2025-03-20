export default {
	fetch: async function ({ projectId, resourceId }, key) {
		const url = `/api/project/${projectId}/resource/${resourceId}?includeUser=1&includeVoteCount=1&includeUserVote=1&includeTags=1&includeStatus=1`;
		const headers = {
			"Content-Type": "application/json",
		};

		return this.fetch(url, { headers });
	},

	update: async function ({ projectId, resourceId }, data) {
		const url = `/api/project/${projectId}/resource/${resourceId}`;
		const headers = {
			"Content-Type": "application/json",
		};
		const json = await this.fetch(url, {
			headers,
			method: "put",
			body: JSON.stringify(data),
		});

		const event = new window.CustomEvent("osc-api-update-data", {
			detail: { type: "resource", resource: json, data },
		});
		window.dispatchEvent(event);

		return json;
	},

	delete: async function ({ projectId, resourceId }, data) {
		const url = `/api/project/${projectId}/resource/${resourceId}`;
		const method = "delete";

		const newData = await this.fetch(url, { method });
		return { id: data.id };
	},

	submitLike: async function ({ projectId, resourceId }, data) {
		const url = `/api/project/${projectId}/vote`;
		const headers = {
			"Content-Type": "application/json",
		};

		const json = await this.fetch(url, {
			headers,
			method: "POST",
			body: JSON.stringify({ resourceId, opinion: data.opinion }),
		});

		const event = new window.CustomEvent("osc-resource-submit-like", {
			detail: { type: "resource", resourceId, data },
		});
		window.dispatchEvent(event);

		return json;
	},
};
