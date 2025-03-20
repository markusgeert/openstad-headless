import { useSWRConfig } from "swr";
import useSWR from "swr";
import API from "./api";
import useArea from "./hooks/use-area.js";
import useAreas from "./hooks/use-areas.js";
import useChoiceGuideResults from "./hooks/use-choiceguide-results";
import useChoicesguide from "./hooks/use-choicesguide";
import useCommentsByProject from "./hooks/use-comments-by-project";
import useComments from "./hooks/use-comments.js";
import useCurrentUser from "./hooks/use-current-user.js";
import useDatalayer from "./hooks/use-datalayer.js";
import useResource from "./hooks/use-resource.js";
import useResources from "./hooks/use-resources.js";
import useSubmissions from "./hooks/use-submissions.js";
import useTags from "./hooks/use-tags.js";
import useUserActivity from "./hooks/use-user-activity";
import useUserVote from "./hooks/use-user-vote.js";
import useWidget from "./hooks/use-widget";
import mergeData from "./merge-data";

const windowGlobal = typeof window !== "undefined" ? window : {};

windowGlobal.OpenStadSWR = windowGlobal.OpenStadSWR || {}; // keys used, for forced updates

function DataStore(props = {}) {
	this.api = new API(props);
	this.projectId = props.projectId;

	// hooks
	this.useResource = useResource.bind(this);
	this.useChoicesguide = useChoicesguide.bind(this);
	this.useComments = useComments.bind(this);
	this.useResources = useResources.bind(this);
	this.useArea = useArea.bind(this);
	this.useDatalayer = useDatalayer.bind(this);
	this.useAreas = useAreas.bind(this);
	this.useTags = useTags.bind(this);
	this.useCurrentUser = useCurrentUser.bind(this);
	this.useUserVote = useUserVote.bind(this);
	this.useSubmissions = useSubmissions.bind(this);
	this.useCommentsByProject = useCommentsByProject.bind(this);
	this.useChoiceGuideResults = useChoiceGuideResults.bind(this);
	this.useUserActivity = useUserActivity.bind(this);
	this.useWidget = useWidget.bind(this);

	// current user
	const {
		data: currentUser,
		error: currentUserError,
		isLoadingLcurrentUserIsLoading,
	} = this.useCurrentUser({ ...props, projectId: this.projectId });

	this.currentUser = currentUser;

	// swr
	this.createKey = (props, fetcherAsString) => {
		let type = fetcherAsString;
		type = type.replace(/^([^.]*).*$/, "$1");
		return { type, ...props };
	};

	this.useSWR = (props, fetcherAsString, options = {}) => {
		const fetcherPath = fetcherAsString.split(".");
		let fetcher = this.api;

		// fetcherAsString can be a path to a fetcher function, e.g. 'resources.fetch'
		// if so, we need to traverse the api object to find the fetcher function
		if (fetcherPath.length > 1) {
			for (let i = 0; i < fetcherPath.length; i++) {
				if (!fetcher[fetcherPath[i]]) {
					throw new Error(`uswSWF: fetcher ${fetcherAsString} not found`);
				}
				fetcher = fetcher[fetcherPath[i]];
			}
			// otherwise, fetcherAsString is the name of the fetcher function and we use that directly
		} else {
			fetcher = this.api[fetcherAsString];
		}

		const key = this.createKey(props, fetcherAsString);

		windowGlobal.OpenStadSWR[JSON.stringify(key, null, 2)] = true;

		return useSWR(key, () =>
			fetcher(props, { ...options, keepPreviousData: true }),
		);
	};

	const { mutate } = useSWRConfig();
	this.mutate = async (props, fetcherAsString, newData, options) => {
		// TODO: meesturen mutate options

		const fetcher = fetcherAsString
			.split(".")
			.reduce((obj, key) => obj[key], this.api);
		const key = this.createKey(props, fetcherAsString);

		const defaultOptions = {
			optimisticData: (currentData) =>
				mergeData(currentData, newData, options.action),
			revalidate: false,
			rollbackOnError: true,
		};
		if (options.action !== "fetch" && options.revalidate !== true) {
			defaultOptions.populateCache = (newData, currentData) =>
				mergeData(currentData, newData, options.action);
		}

		if (newData?.parentId) {
			// currently for comments: replies are subobjects and SWR can't handle that
			defaultOptions.revalidate = true;
		}

		return await mutate(key, fetcher(key, newData, options), {
			...defaultOptions,
			...options,
		});

		// return mutate( // mutate other caches; resource taken from https://koba04.medium.com/organize-swr-cache-with-tag-33d5b1aac3bd
		//   cacheKey => cacheKey != key && cacheKey.type == key.type,
		//   currentData => mergeData(currentData, newData),
		//   { revalidate: false } // meybe true? or option?
		// );
	};

	this.refresh = () => {
		mutate(
			(cacheKey) =>
				Object.keys(windowGlobal.OpenStadSWR).indexOf(
					JSON.stringify(cacheKey, null, 2),
				) !== -1,
			async (currentData) => currentData, // optimistic ui as fetcher
			{
				revalidate: true,
				rollbackOnError: true,
			},
		);
	};
}

export { DataStore as default, DataStore };
