import DataStore from "@openstad-headless/data-store/src";
import { MultiSelect } from "@openstad-headless/ui/src";
import { FormLabel } from "@utrecht/component-library-react";
import React from "react";

//Todo correctly type resources. Will be possible when the datastore is correctly typed

// Nasty but make datastore an any type so we can use it without needing an import from a different workspace
type Props = {
	dataStore: any;
	tagType: string;
	placeholder?: string;
	selected?: number[];
	onUpdateFilter?: (filter: any, label?: string) => void;
	onlyIncludeIds?: number[];
	quickFixTags?: TagDefinition[];
	tagGroupProjectId?: any;
};

type TagDefinition = { id: number; name: string; projectId?: any };

const MultiSelectTagFilter = ({
	dataStore,
	tagType,
	onUpdateFilter,
	selected = [],
	onlyIncludeIds = [],
	quickFixTags = [],
	...props
}: Props) => {
	if (!dataStore || !dataStore.useTags) {
		return <p>Cannot render tagfilter, missing data source</p>;
	}

	const { data: tags } = dataStore.useTags({
		type: tagType,
		onlyIncludeIds,
	});

	const randomId = Math.random().toString(36).substring(7);

	function getRandomId(placeholder: string | undefined) {
		if (placeholder && placeholder.length >= 1) {
			return placeholder
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, "")
				.replace(/\s+/g, "-");
		} else {
			return randomId;
		}
	}

	const filterTags =
		quickFixTags.length > 0
			? quickFixTags.filter(
					(tag) => tag.projectId === Number.parseInt(props.tagGroupProjectId),
				)
			: tags;

	return (
		<div className="form-element">
			<FormLabel htmlFor={getRandomId(props.placeholder)}>
				{props.placeholder || "Selecteer item"}
			</FormLabel>
			<MultiSelect
				id={getRandomId(props.placeholder)}
				label={props.placeholder || ""}
				onItemSelected={(value, label) => {
					onUpdateFilter && onUpdateFilter(value, label);
				}}
				options={(filterTags || []).map((tag: TagDefinition) => ({
					value: tag.id,
					label: tag.name,
					checked: selected.includes(tag.id),
				}))}
			/>
		</div>
	);
};
export { MultiSelectTagFilter };
