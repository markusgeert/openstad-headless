import "leaflet";

import { LatLng, latLngBounds } from "leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { useMapEvents } from "react-leaflet/hooks";
import { loadWidget } from "../../lib/load-widget";
import { Area, isPointInArea } from "./area";
import parseLocation from "./lib/parse-location";
import { MapConsumer, useMapRef } from "./map-consumer";
import Marker from "./marker";
import MarkerClusterGroup from "./marker-cluster-group";
import TileLayer from "./tile-layer";
import type { BaseMapWidgetProps } from "./types/basemap-widget-props";
// ToDo: import { searchAddressByLatLng, suggestAddresses, LookupLatLngByAddressId } from './lib/search.js';

function isRdCoordinates(x: number, y: number) {
	return x > 0 && x < 300000 && y > 300000 && y < 620000; // Typische ranges voor RD-coördinaten
}

// RD naar WGS84 (lat, lon) conversie
const rdToWgs84 = (x: number, y: number) => {
	if (x < 1000) x *= 1000;
	if (y < 1000) y *= 1000;

	const x0 = 155000.0;
	const y0 = 463000.0;

	const f0 = 52.156160556;
	const l0 = 5.387638889;

	const a01 = 3236.0331637;
	const b10 = 5261.3028966;
	const a20 = -32.5915821;
	const b11 = 105.9780241;
	const a02 = -0.2472814;
	const b12 = 2.4576469;
	const a21 = -0.8501341;
	const b30 = -0.8192156;
	const a03 = -0.0655238;
	const b31 = -0.0560092;
	const a22 = -0.0171137;
	const b13 = 0.0560089;
	const a40 = 0.0052771;
	const b32 = -0.0025614;
	const a23 = -0.0003859;
	const b14 = 0.001277;
	const a41 = 0.0003314;
	const b50 = 0.0002574;
	const a04 = 0.0000371;
	const b33 = -0.0000973;
	const a42 = 0.0000143;
	const b51 = 0.0000293;
	const a24 = -0.000009;
	const b15 = 0.0000291;

	const dx = (x - x0) * 10 ** -5;
	const dy = (y - y0) * 10 ** -5;

	let df =
		a01 * dy +
		a20 * dx ** 2 +
		a02 * dy ** 2 +
		a21 * dx ** 2 * dy +
		a03 * dy ** 3;
	df +=
		a40 * dx ** 4 +
		a22 * dx ** 2 * dy ** 2 +
		a04 * dy ** 4 +
		a41 * dx ** 4 * dy;
	df +=
		a23 * dx ** 2 * dy ** 3 + a42 * dx ** 4 * dy ** 2 + a24 * dx ** 2 * dy ** 4;

	const f = f0 + df / 3600;

	let dl =
		b10 * dx +
		b11 * dx * dy +
		b30 * dx ** 3 +
		b12 * dx * dy ** 2 +
		b31 * dx ** 3 * dy;
	dl +=
		b13 * dx * dy ** 3 +
		b50 * dx ** 5 +
		b32 * dx ** 3 * dy ** 2 +
		b14 * dx * dy ** 4;
	dl += b51 * dx ** 5 * dy + b33 * dx ** 3 * dy ** 3 + b15 * dx * dy ** 5;

	const l = l0 + dl / 3600;

	const fWgs = f + (-96.862 - 11.714 * (f - 52) - 0.125 * (l - 5)) / 100000;
	const lWgs = l + (-37.902 + 0.329 * (f - 52) - 14.667 * (l - 5)) / 100000;

	return {
		lat: fWgs,
		lon: lWgs,
	};
};

import "leaflet/dist/leaflet.css";
import "./css/base-map.css";
import L from "leaflet";
import React from "react";
import type { LocationType } from "./types/location";
import type { MarkerProps } from "./types/marker-props";

const BaseMap = ({
	iconCreateFunction = undefined,
	defaultIcon = undefined,

	area = [],
	areaPolygonStyle = undefined,

	markers = [],

	autoZoomAndCenter = undefined,

	zoom = 7,
	scrollWheelZoom = true,
	center = {
		lat: 52.37104644463586,
		lng: 4.900402911007405,
	},

	tilesVariant = "nlmaps",
	tiles = undefined,
	minZoom = 7,
	maxZoom = 20,

	categorize = undefined,

	// ToDo: search = false,

	clustering = {
		isActive: true,
	},

	onClick = undefined,
	onMarkerClick = undefined,

	width = "100%",
	height = undefined,
	customPolygon = [],
	mapDataLayers = [],
	...props
}: PropsWithChildren<
	BaseMapWidgetProps & {
		onClick?: (
			e: LeafletMouseEvent & { isInArea: boolean },
			map: object,
		) => void;
	}
>) => {
	const definedCenterPoint =
		center.lat && center.lng
			? { lat: center.lat, lng: center.lng }
			: { lat: 52.37104644463586, lng: 4.900402911007405 };

	tilesVariant = props?.map?.tilesVariant || tilesVariant || "nlmaps";
	const customUrlSetting =
		tilesVariant === "custom" ? props?.map?.customUrl : undefined;

	// clustering geeft errors; ik begrijp niet waarom: het gebeurd alleen in de gebuilde widgets, niet in de dev componenten
	// het lijkt een timing issue, waarbij niet alles in de juiste volgporde wordt geladen
	// voor nu staat het dus uit
	clustering = {
		isActive: false,
	};

	const [currentMarkers, setCurrentMarkers] = useState(markers);
	const [mapId] = useState(
		`${Number.parseInt((Math.random() * 1e8) as any as string)}`,
	);
	const [mapRef] = useMapRef(mapId);

	const setBoundsAndCenter = useCallback(
		(polygons: Array<Array<LocationType>>) => {
			const allPolygons: LocationType[][] = [];

			if (polygons && Array.isArray(polygons)) {
				polygons.forEach((points: Array<LocationType>) => {
					const poly: LocationType[] = [];
					if (points && Array.isArray(points)) {
						points.forEach((point: LocationType) => {
							parseLocation(point);
							if (point.lat) {
								poly.push(point);
							}
						});
					}
					if (poly.length > 0) {
						allPolygons.push(poly);
					}
				});
			}

			if (allPolygons.length === 0) {
				mapRef.panTo(
					new LatLng(definedCenterPoint.lat, definedCenterPoint.lng),
				);
				return;
			}

			if (
				allPolygons.length === 1 &&
				allPolygons[0].length === 1 &&
				allPolygons[0][0].lat &&
				allPolygons[0][0].lng
			) {
				mapRef.panTo(new LatLng(allPolygons[0][0].lat, allPolygons[0][0].lng));
				return;
			}

			const combinedBounds = latLngBounds([]);
			allPolygons.forEach((poly) => {
				const bounds = latLngBounds(
					poly.map(
						(p) =>
							new LatLng(
								p.lat || definedCenterPoint.lat,
								p.lng || definedCenterPoint.lng,
							),
					),
				);
				combinedBounds.extend(bounds);
			});

			mapRef.fitBounds(combinedBounds);
		},
		[center, mapRef],
	);

	// map is ready
	useEffect(() => {
		const event = new CustomEvent("osc-map-is-ready", {
			detail: { id: mapId },
		});
		window.dispatchEvent(event);
	}, [mapId]);

	// auto zoom and center on init
	useEffect(() => {
		if (!mapRef) return;
		if (autoZoomAndCenter) {
			if (autoZoomAndCenter === "area" && area) {
				const updatedArea = Array.isArray(area[0]) ? area : [area];
				return setBoundsAndCenter(updatedArea as any);
			}
			if (currentMarkers?.length) {
				return setBoundsAndCenter(currentMarkers as any);
			}
			if (center) {
				setBoundsAndCenter([center] as any);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapRef, area, center]);

	// markers
	useEffect(() => {
		if (
			markers.length === 0 &&
			currentMarkers.length === 0 &&
			mapDataLayers.length === 0
		)
			return;

		const result = [...markers];

		if (mapDataLayers.length > 0) {
			mapDataLayers?.forEach((dataLayer: any) => {
				const records = dataLayer?.layer?.result?.records;
				const geoJsonFeatures = dataLayer?.layer?.features;

				if (records && Array.isArray(records)) {
					records.forEach((record) => {
						const { lat, lon, titel, inhoud } = record;
						const long = lon || record.long;

						if (lat && long) {
							let icon = dataLayer?.icon;
							icon = !!icon && icon.length > 0 ? icon[0].url : undefined;

							if (icon) {
								const markerData: MarkerProps = {
									lat,
									lng: long,
									title: titel,
									description: inhoud,
									markerId: `${Number.parseInt((Math.random() * 1e8).toString())}`,
									isVisible: true,
									isClustered: false,
								};

								markerData.icon = L.icon({
									iconUrl: icon,
									iconSize: [30, 40],
									iconAnchor: [15, 40],
									className: "custom-image-icon",
								});

								result.push(markerData);
							}
						}
					});
				}

				if (geoJsonFeatures && Array.isArray(geoJsonFeatures)) {
					geoJsonFeatures.forEach((feature) => {
						const coordinates = feature.geometry?.coordinates;
						let lat = coordinates?.[1];
						let long = coordinates?.[0];
						const { Objectnaam, Locatieaanduiding } = feature.properties;

						if (isRdCoordinates(long, lat)) {
							const converted = rdToWgs84(long, lat);
							lat = converted.lat;
							long = converted.lon;
						}

						if (lat && long) {
							let icon = dataLayer?.icon;
							icon = !!icon && icon.length > 0 ? icon[0].url : undefined;

							if (icon) {
								const markerData: MarkerProps = {
									lat,
									lng: long,
									title: Objectnaam,
									description: Locatieaanduiding,
									markerId: `${Number.parseInt((Math.random() * 1e8).toString())}`,
									isVisible: true,
									isClustered: false,
								};

								markerData.icon = L.icon({
									iconUrl: icon,
									iconSize: [30, 40],
									iconAnchor: [15, 40],
									className: "custom-image-icon",
								});

								result.push(markerData);
							}
						}
					});
				}
			});
		}

		result.map((marker, i) => {
			// unify location format
			parseLocation(marker);

			// add
			const markerData: MarkerProps = { ...marker };
			markerData.markerId = `${Number.parseInt((Math.random() * 1e8).toString())}`;

			// iconCreateFunction
			markerData.iconCreateFunction =
				markerData.iconCreateFunction || iconCreateFunction;

			// categorize
			if (
				categorize?.categorizeByField &&
				markerData.data?.[categorize.categorizeByField]
			) {
				const type = markerData.data?.[categorize.categorizeByField];
				const category = categorize.categories?.[type];
				if (category) {
					if (!markerData.icon) {
						let icon = category.icon;
						if (!icon && category.color) {
							icon = { ...defaultIcon, color: category.color };
						}
						if (icon) {
							markerData.icon = icon;
						}
					}
				}
			}

			// fallback on defaultIcon
			if (!markerData.icon && defaultIcon) {
				if (markerData.color) {
					markerData.icon = { ...defaultIcon, color: markerData.color };
				} else {
					markerData.icon = defaultIcon;
				}
			}

			markerData.onClick = markerData.onClick
				? [...markerData.onClick, onMarkerClick]
				: [onMarkerClick];

			// ToDo
			markerData.isVisible = true;

			if (clustering?.isActive && !markerData.doNotCluster) {
				markerData.isClustered = false;
			}

			result[i] = markerData;
		});

		if (result.length !== currentMarkers.length) {
			setCurrentMarkers(result);
		} else {
			const isDifferent = result.some(
				(marker, index) =>
					marker.lat !== currentMarkers[index]?.lat ||
					marker.lng !== currentMarkers[index]?.lng,
			);

			if (isDifferent) {
				setCurrentMarkers(result);
			}
		}
	}, [markers, mapDataLayers]);

	const clusterMarkers: MarkerProps[] = [];

	// ToDo: waarom kan ik die niet gewoon als props meesturen
	const tileLayerProps = {
		tilesVariant,
		customUrlSetting,
		tiles,
		minZoom,
		maxZoom,
		...props,
	};

	useEffect(() => {
		document.documentElement.style.setProperty("--basemap-map-width", width);
		document.documentElement.style.setProperty(
			"--basemap-map-height",
			height ? `${height}px` : "auto",
		);
		document.documentElement.style.setProperty(
			"--basemap-map-aspect-ratio",
			height ? "unset" : "16 / 9",
		);
	}, [width, height]);

	return (
		<>
			<div className="map-container osc-map">
				<MapContainer
					center={[definedCenterPoint.lat, definedCenterPoint.lng]}
					className="osc-base-map-widget-container"
					id={`osc-base-map-${mapId}`}
					scrollWheelZoom={scrollWheelZoom}
					zoom={zoom}
				>
					<MapConsumer mapId={mapId} />

					<TileLayer {...tileLayerProps} />

					{area?.length ? (
						<Area
							area={area}
							areas={customPolygon}
							areaPolygonStyle={areaPolygonStyle}
							{...props}
						/>
					) : null}

					{!!currentMarkers &&
						currentMarkers.length > 0 &&
						currentMarkers.map((data) => {
							if (data.isClustered) {
								clusterMarkers.push(data);
							} else if (data.lat && data.lng) {
								return (
									<Marker
										{...props}
										{...data}
										key={`marker-${data.markerId || data.lat + data.lng}`}
									/>
								);
							}
						})}

					{clusterMarkers.length > 0 && (
						<MarkerClusterGroup
							{...props}
							{...clustering}
							categorize={categorize}
							markers={clusterMarkers}
						/>
					)}

					<MapEventsListener
						area={area}
						onClick={(e, map) => onClick?.({ ...e, isInArea: e.isInArea }, map)}
						onMarkerClick={onMarkerClick}
					/>
				</MapContainer>
			</div>
		</>
	);
};

type MapEventsListenerProps = {
	area?: Array<LocationType>;
	onClick?: (e: LeafletMouseEvent & { isInArea: boolean }, map: object) => void;
	onMarkerClick?: (e: LeafletMouseEvent, map: any) => void;
};

function MapEventsListener({
	area = [],
	onClick = undefined,
	onMarkerClick = undefined,
}: MapEventsListenerProps) {
	const map = useMapEvents({
		load: () => {
			console.log("ONLOAD");
		},
		click: (e: LeafletMouseEvent) => {
			const targetElement = e.originalEvent.target as HTMLElement;
			const isMarkerClick = targetElement.closest(".leaflet-marker-icon");

			if (isMarkerClick && onMarkerClick) {
				const customEvent = new CustomEvent("osc-marker-click", { detail: e });
				window.dispatchEvent(customEvent);

				onMarkerClick(e, map);

				return;
			}

			const areaLatLngs = area.map(parseLocation) as LatLng[];
			const isInArea = !area?.length || isPointInArea(areaLatLngs, e.latlng);

			const customEvent = new CustomEvent("osc-map-click", {
				detail: { ...e, isInArea },
			});
			window.dispatchEvent(customEvent);

			if (onClick) {
				if (typeof onClick === "string") {
					const resolvedFunction = globalThis[onClick];
					if (typeof resolvedFunction === "function") {
						onClick = resolvedFunction;
					} else {
						console.warn(`Function ${onClick} is not defined on globalThis.`);
						return;
					}
				}

				onClick({ ...e, isInArea }, map);
			}
		},
	});

	return null;
}

BaseMap.loadWidget = loadWidget;
export { BaseMap };
