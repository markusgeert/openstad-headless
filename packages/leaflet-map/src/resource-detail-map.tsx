import DataStore from "@openstad-headless/data-store/src";
import type { PropsWithChildren } from "react";
import { loadWidget } from "../../lib/load-widget";
import parseLocation from "./lib/parse-location";

import "leaflet/dist/leaflet.css";
import "./css/base-map.css";

import React from "react";
import { BaseMap } from "./base-map";
import type { MarkerProps } from "./types/marker-props";
import type { ResourceDetailMapWidgetProps } from "./types/resource-detail-map-widget-props";

const ResourceDetailMap = ({
	resourceId = undefined,
	marker = undefined,
	markerIcon = undefined,
	center = undefined,
	resourceIdRelativePath = "openstadResourceId",
	...props
}: PropsWithChildren<ResourceDetailMapWidgetProps>) => {
	props.zoom ||= 7;

	const datastore = new DataStore({
		projectId: props.projectId,
		api: props.api,
		config: { api: props.api },
	});

	const urlParams = new URLSearchParams(window.location.search);

	resourceId = resourceId || urlParams.get(resourceIdRelativePath);

	if (!resourceId && resourceIdRelativePath.includes("[id]")) {
		const paramNameMatch = resourceIdRelativePath.match(/[?&]([^=]+)=\[id]/);
		if (paramNameMatch?.[1]) {
			const paramName = paramNameMatch[1];
			resourceId = urlParams.get(paramName);
		}
	}

	const { data: resource } = datastore.useResource({
		projectId: props.projectId,
		resourceId: resourceId,
	});

	let currentMarker: MarkerProps;
	currentMarker = {
		...marker,
		lat: resource.location?.lat || undefined,
		lng: resource.location?.lng || undefined,
		icon: marker?.icon || markerIcon,
	};
	parseLocation(currentMarker); // unify location format

	let currentCenter = center;
	if (resource?.location) {
		currentCenter = { ...resource.location };
	}

	const { data: areas } = datastore.useArea({
		projectId: props.projectId,
	});

	const areaId = props?.map?.areaId || false;
	const polygon =
		areaId && Array.isArray(areas) && areas.length > 0
			? areas.find((area) => area.id.toString() === areaId)?.polygon
			: [];

	const zoom = {
		minZoom: props?.map?.minZoom ? Number.parseInt(props.map.minZoom) : 7,
		maxZoom: props?.map?.maxZoom ? Number.parseInt(props.map.maxZoom) : 20,
	};

	return (
		<>
			<BaseMap
				{...props}
				{...zoom}
				area={polygon}
				autoZoomAndCenter="area"
				center={currentCenter}
				markers={[currentMarker]}
			/>
		</>
	);
};

ResourceDetailMap.loadWidget = loadWidget;

export { ResourceDetailMap };
