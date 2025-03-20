import area from "./area";
import areas from "./areas";
import choiceGuideResults from "./choiceGuideResults";
import choicesguide from "./choicesguide";
import comments from "./comments";
import commentsByProject from "./commentsByProject";
import datalayer from "./datalayer";
import fetchx from "./fetch";
import resource from "./resource";
import resources from "./resources";
import submissions from "./submissions";
import tags from "./tags";
import user from "./user";
import userActivity from "./user-activity";
import userVote from "./user-vote";
import widget from "./widget";

const windowGlobal = typeof window !== "undefined" ? window : {};

windowGlobal.OpenStadAPI = null;
export default function singelton(props = { config: {} }) {
	return (windowGlobal.OpenStadAPI =
		windowGlobal.OpenStadAPI || new API(props));
}

export function getApiFetchMethodNames() {
	const apiInstance = new API({ logMethods: true });
	const apiFetchMethodNames = [];

	for (const key of Object.keys(apiInstance)) {
		const value = apiInstance[key];
		if (value && typeof value === "object" && "fetch" in value) {
			apiFetchMethodNames.push(key);
		}
	}

	return apiFetchMethodNames;
}

function API(props = {}) {
	this.apiUrl = props.apiUrl || props.api?.url || null;
	this.projectId = props.projectId || 0;

	this.fetch = fetchx.bind(this);

	this.choiceGuideResults = {
		fetch: choiceGuideResults.fetch.bind(this),
	};

	this.comments = {
		fetch: comments.fetch.bind(this),
		create: comments.create.bind(this),
		update: comments.update.bind(this),
		delete: comments.delete.bind(this),
		submitLike: comments.submitLike.bind(this),
	};

	this.commentsByProject = {
		fetch: commentsByProject.fetch.bind(this),
	};

	this.resource = {
		fetch: resource.fetch.bind(this),
		update: resource.update.bind(this),
		delete: resource.delete.bind(this),
		submitLike: resource.submitLike.bind(this),
	};

	this.resources = {
		fetch: resources.fetch.bind(this),
		delete: resources.delete.bind(this),
		create: resources.create.bind(this),
		submitLike: resources.submitLike.bind(this),
	};

	this.choicesguide = {
		fetch: choicesguide.fetch.bind(this),
		create: choicesguide.create.bind(this),
	};

	this.submissions = {
		fetch: submissions.fetch.bind(this),
		create: submissions.create.bind(this),
	};

	this.tags = {
		fetch: tags.fetch.bind(this),
		create: tags.create.bind(this),
		update: tags.update.bind(this),
		delete: tags.delete.bind(this),
	};

	this.area = {
		fetch: area.fetch.bind(this),
	};

	this.datalayer = {
		fetch: datalayer.fetch.bind(this),
	};

	this.widget = {
		fetch: widget.fetch.bind(this),
	};

	this.areas = {
		fetch: areas.fetch.bind(this),
	};

	this.user = {
		fetch: user.fetch.bind(this),
		fetchMe: user.fetchMe.bind(this),
		connectUser: user.connectUser.bind(this),
		update: user.update.bind(this),
		logout: user.logout.bind(this),
	};

	this.userVote = {
		fetch: userVote.fetch.bind(this),
		submitVote: userVote.submitVote.bind(this),
	};

	this.userActivity = {
		fetch: userActivity.fetch.bind(this),
	};

	if (props.logMethods) {
		return this;
	}
}
