import { loadWidget } from "@openstad-headless/lib/load-widget";
import React, { useEffect, useState } from "react";
import { ChoiceGuideSidebar } from "../../choiceguide/src/includes/sidebar.js";
import type { ChoiceGuideResultsProps } from "./props.js";
import "./style.css";
import DataStore from "@openstad-headless/data-store/src";
import type { FormValue } from "@openstad-headless/form/src/form";
import { InitializeWeights } from "../../choiceguide/src/parts/init-weights.js";
import type { WeightOverview } from "../../choiceguide/src/props";

function ChoiceGuideResults(props: ChoiceGuideResultsProps) {
	const [weights, setWeights] = useState<WeightOverview>({});
	const [answers, setAnswers] = useState<{ [key: string]: FormValue }>({});

	const datastore: any = new DataStore({
		projectId: props.projectId,
		api: props.api,
	});

	const { data: choiceGuideWidget } = datastore.useWidget({
		projectId: props.projectId,
		widgetId: props.choiceguideWidgetId,
	});

	const { choiceGuide, items, choiceOption, widgetId } =
		choiceGuideWidget?.config || {};

	useEffect(() => {
		if (!items || items.length === 0 || !choiceOption) return;

		const initialWeights = InitializeWeights(
			items,
			choiceOption?.choiceOptions,
		);
		setWeights(initialWeights);
	}, [items, choiceOption]);

	useEffect(() => {
		if (!props.choiceguideWidgetId) return;
		const localStorageAnswers = localStorage.getItem(
			`choiceguide-${props.projectId}-${props.choiceguideWidgetId}`,
		);

		try {
			if (localStorageAnswers) {
				setAnswers(JSON.parse(localStorageAnswers));
			}
		} catch (e) {
			console.error(e);
		}
	}, []);

	return choiceGuideWidget.length === 0 || !choiceGuideWidget?.config ? (
		<p>Laden...</p>
	) : (
		<div className="osc">
			<div className="osc-choiceguide-results-container">
				<ChoiceGuideSidebar
					{...choiceGuide}
					choiceOptions={choiceOption?.choiceOptions}
					weights={weights}
					answers={answers}
					widgetId={widgetId}
				/>
			</div>
		</div>
	);
}

ChoiceGuideResults.loadWidget = loadWidget;
export { ChoiceGuideResults };
