import fetch from "./fetch";

export default {
	fetch: async ({ projectId, type }) => {
		// todo, maar voor nu ff niet relevant
		return {};
	},

	submitVote: async function ({ projectId, type }, data) {
		console.log("SUBMIT VOTE");

		const url = `/api/project/${projectId}/vote`;
		const headers = {
			"Content-Type": "application/json",
		};

		const votes = data.map((resource) => ({
			resourceId: resource.id,
			opinion: "selected",
		}));

		const json = await this.fetch(url, {
			headers,
			method: "POST",
			body: JSON.stringify(votes),
		});

		const event = new window.CustomEvent("osc-submit-user-vote", {
			detail: { type: "userVote", votes },
		});
		window.dispatchEvent(event);

		return json;
	},
};
