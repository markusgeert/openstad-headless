import DataStore from "@openstad-headless/data-store/src";
import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { Polygon, Popup } from "react-leaflet";
import type { AreaProps } from "./types/area-props.js";

import type { BaseProps } from "@openstad-headless/types";
import { difference, polygon as tPolygon } from "turf";

function createCutoutPolygonMulti(areas: { lat: number; lng: number }[][]) {
	const outerBoxCoordinates = [
		[-180, -90],
		[180, -90],
		[180, 90],
		[-180, 90],
		[-180, -90],
	];

	const outerBox = tPolygon([outerBoxCoordinates]);

	const cutOutCoordinates = [outerBoxCoordinates];

	areas.forEach((area) => {
		const innerPolygon = tPolygon([area.map(({ lat, lng }) => [lng, lat])]);
		const newCutOut = difference(outerBox, innerPolygon) || outerBox;

		if (
			newCutOut?.geometry?.coordinates &&
			newCutOut?.geometry?.coordinates.length > 1
		) {
			cutOutCoordinates.push(newCutOut?.geometry?.coordinates[1]);
		}
	});

	return cutOutCoordinates;
}

export function isPointInArea(
	area: Array<Array<LatLng>> | Array<LatLng>,
	point: LatLng,
) {
	if (!point) return false;
	if (!area) return true;

	if (Array.isArray(area[0])) {
		for (const poly of area) {
			if (isPointInSinglePolygon(Array.isArray(poly) ? poly : [poly], point)) {
				return true;
			}
		}
		return false;
	}
	return isPointInSinglePolygon(area as Array<LatLng>, point);
}

function isPointInSinglePolygon(area: Array<LatLng>, point: LatLng) {
	const x = point.lat;
	const y = point.lng;

	let inside = false;
	for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
		const xi = area[i].lat;
		const yi = area[i].lng;
		const xj = area[j].lat;
		const yj = area[j].lng;

		const intersect =
			yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}

	return inside;
}
export function Area({
	area = [],
	areas,
	areaPolygonStyle = {
		color: "#d00",
		fillColor: "#000",
		fillOpacity: 0.15,
	},
	...props
}: BaseProps & AreaProps) {
	const datastore = new DataStore({});
	const { data: allAreas } = datastore.useArea({
		projectId: props.projectId,
	});

	interface Area {
		id: number;
		name: string;
		url: string;
	}

	const [poly, setPoly] = useState<any>([]);

	useEffect(() => {
		if (area && area.length > 0) {
			let validPolygons: LatLng[][] = [];

			if (Array.isArray(area[0])) {
				validPolygons = area.map((polygon: any) =>
					polygon.map(({ lat, lng }: { lat: number; lng: number }) => ({
						lat,
						lng,
					})),
				);
			} else {
				validPolygons = [area.map(({ lat, lng }) => new LatLng(lat, lng))];
			}

			const cutout = createCutoutPolygonMulti(validPolygons);

			setPoly(cutout);
		}
	}, [area]);

	const multiPolygon: any[] = [];
	const areaIds = areas?.map((item: Area) => item.id);
	const filteredAreas = allAreas.filter((item: any) =>
		areaIds?.includes(item.id),
	);

	if (filteredAreas) {
		filteredAreas.forEach((item: any) => {
			multiPolygon.push({ title: item.name, polygon: item.polygon });
		});
		areas.forEach((item: any) => {
			const existingItem = multiPolygon.find(
				(polygonItem) => polygonItem.title === item.name,
			);
			if (existingItem) {
				existingItem.url = item.url;
			}
		});
	}

	return (
		<>
			{multiPolygon.length > 0
				? multiPolygon.map((item, index) => (
						<>
							<Polygon
								key={index}
								{...props}
								pathOptions={areaPolygonStyle}
								positions={item.polygon}
								eventHandlers={{
									mouseover: (e) => {
										e.target.setStyle({
											fillOpacity: 0.05,
										});
									},
									mouseout: (e) => {
										e.target.setStyle(areaPolygonStyle);
									},
								}}
							>
								{item.title && (
									<Popup className={"leaflet-popup"}>
										{item.title && (
											<h3 className="utrecht-heading-3">{item.title}</h3>
										)}
										{item.url && (
											<a className="pop-up-link" href={item.url}>
												Lees verder
											</a>
										)}
									</Popup>
								)}
							</Polygon>
						</>
					))
				: poly && (
						<Polygon
							{...props}
							positions={poly.map((ring: any) =>
								ring?.map(([lng, lat]: [number, number]) => [lat, lng]),
							)}
							pathOptions={areaPolygonStyle}
						/>
					)}
		</>
	);
}

export default Area;
