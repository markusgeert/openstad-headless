import { useState } from "react";

export default function useUserVote(props) {
	const projectId = props.projectId;
	const type = props.type;

	const { data, error, isLoading } = this.useSWR(
		{ type: "user-vote", projectId: this.projectId },
		"userVote.fetch",
	);

	// add functionality
	const userVote = data || {};
	userVote.submitVote = (vote) =>
		this.mutate(
			{ type: "user-vote", projectId: this.projectId },
			"userVote.submitVote",
			vote,
			{ action: "update" },
		);

	if (error) {
		const error = new Error(error);
		const event = new window.CustomEvent("osc-error", { detail: error });
		document.dispatchEvent(event);
	}

	return { data: userVote, error, isLoading };
}
