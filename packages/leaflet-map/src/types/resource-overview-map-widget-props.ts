import type { BaseProps, ProjectSettingProps } from "@openstad-headless/types";
import type { MapPropsType } from "../types/index.js";
import type { MarkerIconType } from "./marker-icon.js";
import type { MarkerProps } from "./marker-props.js";

export type ResourceOverviewMapWidgetProps = BaseProps &
	ProjectSettingProps &
	MapPropsType & {
		marker?: MarkerProps;
		markerIcon?: MarkerIconType;
		markerHref?: string;
		countButton?: {
			show: boolean;
			label?: string;
		};
		ctaButton?: {
			show: boolean;
			label?: string;
			href?: string;
		};
		givenResources?: Array<any>;
		resourceOverviewMapWidget?: dataLayerArray;
	};

export type dataLayerArray = {
	datalayer?: DataLayer[];
	enableOnOffSwitching?: boolean;
};

export type DataLayer = {
	id: number | string;
	layer: any;
	icon: any;
	name: string;
	activeOnInit?: boolean;
};
