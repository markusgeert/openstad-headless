export default {
	fetch: async function ({ projectId, choiceGuideId }) {
		const url = `/api/project/${projectId}/choicesguide/${choiceGuideId}/result`;
		return this.fetch(url);
	},
};
