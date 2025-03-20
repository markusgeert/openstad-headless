import type { BaseProps, ProjectSettingProps } from "@openstad-headless/types";

import type { MapPropsType } from "../types/index";

export type BaseMapWidgetProps = BaseProps &
	ProjectSettingProps & {
		resourceId?: string;
		customPolygon?: any;
		mapDataLayers?: any;
	} & MapPropsType;
