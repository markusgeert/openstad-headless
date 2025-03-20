export default () => {
	apos.util.widgetPlayers["openstad-title"] = {
		selector: "[data-openstad-title]",
		player: (el) => {
			ApostropheWidgetsHeading.Heading.loadWidgetOnElement(el, {
				...el.dataset,
			});
		},
	};
};
