import type { BaseProps, ProjectSettingProps } from "@openstad-headless/types";
import type { MapPropsType } from "./index";
import type { MarkerIconType } from "./marker-icon";
import type { MarkerProps } from "./marker-props";

export type ResourceDetailMapWidgetProps = BaseProps &
	ProjectSettingProps &
	MapPropsType & {
		resourceId?: string | null;
		marker?: MarkerProps;
		markerIcon?: MarkerIconType;
		resourceIdRelativePath?: string;
		pageTitle?: boolean;
	};
