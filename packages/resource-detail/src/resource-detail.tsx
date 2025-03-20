import "./resource-detail.css";
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from "@openstad-headless/data-store/src";
import { getResourceId } from "@openstad-headless/lib/get-resource-id";
import { loadWidget } from "@openstad-headless/lib/load-widget";
import type { BaseProps, ProjectSettingProps } from "@openstad-headless/types";
import {
	Carousel,
	Icon,
	IconButton,
	Image,
	Pill,
	Spacer,
} from "@openstad-headless/ui/src";
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import {
	Comments,
	type CommentsWidgetProps,
} from "@openstad-headless/comments/src/comments";
import type { ResourceDetailMapWidgetProps } from "@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props";
import {
	type LikeWidgetProps,
	Likes,
} from "@openstad-headless/likes/src/likes";
import {
	ButtonGroup,
	ButtonLink,
	Heading,
	Heading2,
	Link,
	Paragraph,
} from "@utrecht/component-library-react";
import React, { useEffect, useState } from "react";

import { ResourceDetailMap } from "@openstad-headless/leaflet-map/src/resource-detail-map";
import { Button } from "@utrecht/component-library-react";
import { ShareLinks } from "../../apostrophe-widgets/share-links/src/share-links";
import { hasRole } from "../../lib";

type booleanProps = {
	[K in
		| "displayImage"
		| "displayTitle"
		| "displayModBreak"
		| "displaySummary"
		| "displayDescription"
		| "displayUser"
		| "displayDate"
		| "displayBudget"
		| "displayLocation"
		| "displayBudgetDocuments"
		| "displayLikes"
		| "displayTags"
		| "displayStatus"
		| "displayDocuments"
		| "clickableImage"
		| "displayStatusBar"
		| "displaySocials"]: boolean | undefined;
};

export type ResourceDetailWidgetProps = {
	documentsTitle?: string;
	documentsDesc?: string;
} & BaseProps &
	ProjectSettingProps & {
		projectId?: string;
		resourceId?: string;
		resourceIdRelativePath?: string;
		backUrlIdRelativePath?: string;
		pageTitle?: boolean;
		backUrlText?: string;
	} & booleanProps & {
		likeWidget?: Omit<
			LikeWidgetProps,
			keyof BaseProps | keyof ProjectSettingProps | "resourceId"
		>;
		commentsWidget?: Omit<
			CommentsWidgetProps,
			keyof BaseProps | keyof ProjectSettingProps | "resourceId"
		>;
		commentsWidget_multiple?: Omit<
			CommentsWidgetProps,
			keyof BaseProps | keyof ProjectSettingProps | "resourceId"
		>;
		resourceDetailMap?: Omit<
			ResourceDetailMapWidgetProps,
			keyof BaseProps | keyof ProjectSettingProps | "resourceId"
		>;
	};

type DocumentType = {
	name?: string;
	url?: string;
};

function ResourceDetail({
	displayImage = true,
	displayTitle = true,
	displayModBreak = true,
	displaySummary = true,
	displayDescription = true,
	displayUser = true,
	displayDate = true,
	displayBudget = true,
	displayLocation = true,
	displayBudgetDocuments = true,
	displayLikes = true,
	displayTags = true,
	displayStatus = true,
	displayStatusBar = true,
	displaySocials = true,
	displayDocuments = true,
	clickableImage = false,
	documentsTitle = "",
	documentsDesc = "",
	backUrlText = "Terug naar het document",
	backUrlIdRelativePath = "",
	...props
}: ResourceDetailWidgetProps) {
	const [refreshComments, setRefreshComments] = useState(false);

	const resourceId: string | undefined = String(
		getResourceId({
			resourceId: Number.parseInt(props.resourceId || ""),
			url: document.location.href,
			targetUrl: props.resourceIdRelativePath,
		}),
	); // todo: make it a number throughout the code

	const datastore = new DataStore({
		projectId: props.projectId,
		resourceId: resourceId,
		api: props.api,
	});
	const { data: resource } = datastore.useResource({
		projectId: props.projectId,
		resourceId: resourceId,
	});

	const showDate = (date: string) => {
		return date.split(" ").slice(0, -1).join(" ");
	};

	if (!resource) return null;
	const shouldHaveSideColumn =
		displayLikes ||
		displayTags ||
		displayStatus ||
		displaySocials ||
		displayDocuments;

	let defaultImage = "";

	interface Tag {
		name: string;
		defaultResourceImage?: string;
	}

	if (Array.isArray(resource?.tags)) {
		const sortedTags = resource.tags.sort((a: Tag, b: Tag) =>
			a.name.localeCompare(b.name),
		);

		const tagWithImage = sortedTags.find(
			(tag: Tag) => tag.defaultResourceImage,
		);
		defaultImage = tagWithImage?.defaultResourceImage || "";
	}

	const resourceImages =
		Array.isArray(resource.images) && resource.images.length > 0
			? resource.images
			: [{ url: defaultImage }];
	const hasImages =
		Array.isArray(resourceImages) &&
		resourceImages.length > 0 &&
		resourceImages[0].url !== ""
			? ""
			: "resource-has-no-images";

	const getIdFromHash = () => {
		try {
			const hash = window.location.hash;

			if (hash?.includes("#doc=")) {
				const docParams = hash.split("#doc=")[1];

				const cleanDocParams = docParams.split("#")[0];

				if (cleanDocParams?.includes("?")) {
					const queryParams = cleanDocParams.split("?")[1];

					if (queryParams) {
						const params = queryParams.split("&");

						for (const param of params) {
							const [key, value] = param.split("=");

							if (value && !Number.isNaN(Number(value))) {
								return value;
							}
						}
					}
				}
			}
		} catch (error) {
			console.error("Error while parsing the hash:", error);
		}

		return null;
	};

	const getPageHash = () => {
		if (window.location.hash.includes("#doc")) {
			let url = `/${window.location.hash.split("=")[1]}${window.location.hash.split("=")[2] !== undefined ? `=${window.location.hash.split("=")[2]}` : ""}`;

			if (backUrlIdRelativePath) {
				const backUrlId = getIdFromHash();

				if (backUrlId) {
					url = backUrlIdRelativePath.replace("[id]", backUrlId);
				}
			}

			return (
				<div className="back-url">
					<Link href={url}>{backUrlText}</Link>
				</div>
			);
		}
	};

	// props.commentsWidget?.useSentiments can be undefined, an array or a string with an arrayß
	let useSentiments = props.commentsWidget?.useSentiments;
	if (!!useSentiments && typeof useSentiments === "string") {
		useSentiments = JSON.parse(useSentiments);
	}

	const firstStatus = resource.statuses
		? resource.statuses
				.filter(
					(status: { seqnr: number }) =>
						status.seqnr !== undefined && status.seqnr !== null,
				)
				.sort(
					(a: { seqnr: number }, b: { seqnr: number }) => a.seqnr - b.seqnr,
				)[0] || resource.statuses[0]
		: false;

	const colorClass = firstStatus?.color ? `color-${firstStatus.color}` : "";
	const backgroundColorClass = firstStatus?.backgroundColor
		? `bgColor-${firstStatus.backgroundColor}`
		: "";

	const statusClasses = `${colorClass} ${backgroundColorClass}`.trim();

	const renderImage = (src: string, clickableImage: boolean) => {
		const imageElement = (
			<Image
				src={src}
				imageFooter={
					displayStatusBar &&
					resource.statuses &&
					resource.statuses.length > 0 && (
						<div>
							<Paragraph
								className={`osc-resource-detail-content-item-status ${statusClasses}`}
							>
								{resource.statuses
									?.map((s: { name: string }) => s.name)
									?.join(", ")}
							</Paragraph>
						</div>
					)
				}
			/>
		);

		return clickableImage ? (
			<a href={src} target="_blank" rel="noreferrer">
				{imageElement}
			</a>
		) : (
			imageElement
		);
	};

	const { data: currentUser } = datastore.useCurrentUser({ ...props });
	const resourceUserId = resource?.userId || null;
	const canDelete = hasRole(
		currentUser,
		["moderator", "owner"],
		resourceUserId,
	);

	const onRemoveClick = async (resource: any) => {
		try {
			if (typeof resource.delete === "function") {
				await resource.delete(resource.id);
				setTimeout(() => {
					window.history.back();
				}, 1000);
			} else {
				console.error("Delete method not found on resource");
			}
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		if (props.pageTitle === true && resource.title !== undefined) {
			const current =
				document.title.includes(" - ") && document.title.split(" - ")[0].length
					? ` - ${document.title.split(" - ")[0]}`
					: "";
			document.title = resource.title + current;
		}
	}, [resource]);

	return (
		<section>
			<div
				className={`osc ${
					shouldHaveSideColumn
						? "osc-resource-detail-column-container"
						: "osc-resource-detail-container"
				}`}
			>
				<section className="osc-resource-detail-content osc-resource-detail-content--span-2">
					{getPageHash()}
					{resource ? (
						<article
							className={`osc-resource-detail-content-items ${hasImages}`}
						>
							{displayImage && (
								<Carousel
									items={resourceImages}
									buttonText={{
										next: "Volgende afbeelding",
										previous: "Vorige afbeelding",
									}}
									itemRenderer={(i) => renderImage(i.url, clickableImage)}
								/>
							)}

							{displayTitle && resource.title && (
								<Heading
									level={1}
									appearance="utrecht-heading-2"
									dangerouslySetInnerHTML={{ __html: resource.title }}
								/>
							)}

							{displayModBreak && resource.modBreak && (
								<div className="resource-detail-modbreak-banner">
									<section>
										<Heading level={2} appearance="utrecht-heading-6">
											{props.resources.modbreakTitle}
										</Heading>
										<Heading level={2} appearance="utrecht-heading-6">
											{resource.modBreakDateHumanized}
										</Heading>
									</section>
									<Spacer size={1} />
									<Heading level={2} appearance="utrecht-heading-6">
										{resource.modBreak}
									</Heading>
								</div>
							)}

							<div className="osc-resource-detail-content-item-row">
								{displayUser && resource?.user?.displayName && (
									<div>
										<Heading
											level={2}
											appearance="utrecht-heading-6"
											className="osc-resource-detail-content-item-title"
										>
											Ingediend door
										</Heading>
										<span className="osc-resource-detail-content-item-text">
											{resource.user.displayName}
										</span>
									</div>
								)}
								{displayDate && resource.startDateHumanized && (
									<div>
										<Heading
											level={2}
											appearance="utrecht-heading-6"
											className="osc-resource-detail-content-item-title"
										>
											Datum
										</Heading>
										<span className="osc-resource-detail-content-item-text">
											{showDate(resource.startDateHumanized)}
										</span>
									</div>
								)}
								{displayBudget && resource.budget && (
									<div>
										<Heading
											level={2}
											appearance="utrecht-heading-6"
											className="osc-resource-detail-content-item-title"
										>
											Budget
										</Heading>
										<span className="osc-resource-detail-content-item-text">
											{`€ ${resource.budget.toLocaleString("nl-NL")}`}
										</span>
									</div>
								)}
							</div>
							<div className="resource-detail-content">
								{displaySummary && (
									<Heading
										level={2}
										appearance="utrecht-heading-4"
										dangerouslySetInnerHTML={{ __html: resource.summary }}
									/>
								)}
								{displayDescription && (
									<Paragraph
										dangerouslySetInnerHTML={{ __html: resource.description }}
									/>
								)}
							</div>
							{displayLocation && resource.location && (
								<>
									<Heading level={2} appearance="utrecht-heading-2">
										Plaats
									</Heading>
									<ResourceDetailMap
										resourceId={resource.id || resourceId || "0"}
										resourceIdRelativePath={
											props.resourceIdRelativePath || "openstadResourceId"
										}
										{...props}
										center={resource.location}
										area={props.resourceDetailMap?.area}
									/>
								</>
							)}
						</article>
					) : (
						<span>resource niet gevonden..</span>
					)}
				</section>

				{shouldHaveSideColumn ? (
					<aside className="resource-detail-side-column">
						<div className="aside--content">
							{displayLikes ? (
								<>
									<Likes
										{...props}
										title={props.likeWidget?.title}
										yesLabel={props.likeWidget?.yesLabel}
										noLabel={props.likeWidget?.noLabel}
										displayDislike={props.likeWidget?.displayDislike}
										hideCounters={props.likeWidget?.hideCounters}
										variant={props.likeWidget?.variant}
										showProgressBar={props.likeWidget?.showProgressBar}
										progressBarDescription={
											props.likeWidget?.progressBarDescription
										}
									/>
									<Spacer size={1} />
								</>
							) : null}

							{displayStatus ? (
								<div className="resource-detail-side-section">
									<Spacer size={1} />
									<Heading level={3} appearance="utrecht-heading-4">
										Status
									</Heading>
									<Spacer size={0.5} />
									<div className="resource-detail-pil-list-content">
										{resource.statuses?.map((s: { name: string }) => (
											<Pill light rounded text={s.name} />
										))}
									</div>

									<Spacer size={2} />
								</div>
							) : null}

							{displayTags ? (
								<div className="resource-detail-side-section">
									<Heading level={3} appearance="utrecht-heading-4">
										Tags
									</Heading>

									<Spacer size={0.5} />
									<div className="resource-detail-pil-list-content">
										{(resource.tags as Array<{ type: string; name: string }>)
											?.filter((t) => t.type !== "status")
											?.map((t) => (
												<Pill text={t.name} />
											))}
									</div>
									<Spacer size={2} />
								</div>
							) : null}

							{displaySocials ? (
								<div className="resource-detail-side-section">
									<ShareLinks title={"Deel dit"} />
								</div>
							) : null}
						</div>
						{!!displayDocuments &&
							!!resource &&
							Array.isArray(resource.documents) &&
							resource.documents.length > 0 && (
								<div className="aside--content">
									<Spacer size={2} />
									<div className="document-download-container">
										{!!documentsTitle && (
											<Heading level={2} appearance="utrecht-heading-4">
												{documentsTitle}
											</Heading>
										)}
										{!!documentsDesc && <Paragraph>{documentsDesc}</Paragraph>}
										<ButtonGroup>
											{resource.documents?.map(
												(document: DocumentType, index: number) => (
													<ButtonLink
														appearance="primary-action-button"
														className="osc counter-container"
														download
														href={document.url}
														key={index}
													>
														<Icon icon="ri-download-2-fill" />
														{document.name}
													</ButtonLink>
												),
											)}
										</ButtonGroup>
									</div>
								</div>
							)}
					</aside>
				) : null}
			</div>

			{canDelete && (
				<>
					<Spacer size={2} />
					<Button
						appearance="primary-action-button"
						onClick={() => {
							if (confirm("Deze actie verwijderd de resource"))
								onRemoveClick(resource);
						}}
					>
						Verwijder de inzending
					</Button>
				</>
			)}

			<Spacer size={2} />

			{Array.isArray(useSentiments) && useSentiments?.length ? (
				<section className="resource-detail-comments-container">
					<Comments
						{...props}
						key={refreshComments ? "refresh1" : "no-refresh1"}
						setRefreshComments={setRefreshComments}
						resourceId={resourceId || ""}
						title={props.commentsWidget?.title}
						emptyListText={props.commentsWidget?.emptyListText}
						formIntro={props.commentsWidget?.formIntro}
						placeholder={props.commentsWidget?.placeholder}
						loginText={props.commentsWidget?.loginText}
						closedText={props.commentsWidget?.closedText}
						sentiment={useSentiments[0]}
					/>

					{useSentiments?.length > 1 && (
						<Comments
							{...props}
							key={refreshComments ? "refresh2" : "no-refresh2"}
							setRefreshComments={setRefreshComments}
							resourceId={resourceId || ""}
							title={props.commentsWidget_multiple?.title}
							emptyListText={props.commentsWidget_multiple?.emptyListText}
							formIntro={props.commentsWidget_multiple?.formIntro}
							placeholder={props.commentsWidget_multiple?.placeholder}
							loginText={props.commentsWidget_multiple?.loginText}
							closedText={props.commentsWidget_multiple?.closedText}
							sentiment={useSentiments[1]}
						/>
					)}
				</section>
			) : null}
		</section>
	);
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
