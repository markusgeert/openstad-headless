import './resource-detail.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
  Carousel,
  Image,
  Spacer,
  Pill,
  IconButton,
} from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading4,
  Heading5,
  Heading6,
} from '@utrecht/component-library-react';
import React from 'react';
import { Likes } from '@openstad-headless/likes/src/likes';

export type ResourceDetailWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
    resourceIdRelativePath?: string;
  } & {
    displayImage?: boolean;
    displayTitle?: boolean;
    displaySummary?: boolean;
    displayDescription?: boolean;
    displayUser?: boolean;
    displayDate?: boolean;
    displayBudget?: boolean;
    displayLocation?: boolean;
    displayBudgetDocuments?: boolean;
    displayLikes?: boolean;
    displayTags?: boolean;
    displaySocials?: boolean;
  };

function ResourceDetail({
  displayImage = true,
  displayTitle = true,
  displaySummary = true,
  displayDescription = true,
  displayUser = true,
  displayDate = true,
  displayBudget = true,
  displayLocation = true,
  displayBudgetDocuments = true,
  displayLikes = true,
  displayTags = true,
  displaySocials = true,
  ...props
}: ResourceDetailWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  let resourceId = props.resourceId;

  if (!resourceId && props.resourceIdRelativePath) {
    const currentUrl = location.pathname;
    const currentUrlSegments = currentUrl.split('/');

    const relativePathSegments = (
      props.resourceIdRelativePath.startsWith('/')
        ? props.resourceIdRelativePath
        : `/${props.resourceIdRelativePath}`
    ).split('/');
    const indexContainingSegment = relativePathSegments.findIndex((segment) =>
      segment.includes('[id]')
    );

    if (
      indexContainingSegment > -1 &&
      currentUrlSegments.at(indexContainingSegment)?.match(/^\d+$/)
    ) {
      resourceId = currentUrlSegments[indexContainingSegment];
    }
  } else if (!resourceId) {
    resourceId = `${
      urlParams.get('openstadResourceId')
        ? parseInt(urlParams.get('openstadResourceId') as string)
        : 0
    }`;
  }

  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: resourceId,
    api: props.api,
  });
  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  if (!resource) return null;
  const shouldHaveSideColumn = displayLikes || displayTags || displaySocials;
  return (
    <div
      className={`osc ${
        shouldHaveSideColumn ? 'osc-resource-detail-column-container' : ''
      }`}>
      <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
        {resource ? (
          <article className="osc-resource-detail-content-items">
            {displayImage && (
              <Carousel
                items={resource.images}
                itemRenderer={(i) => (
                  <Image
                    src={resource.images?.at(0)?.url || ''}
                    imageFooter={
                      <div>
                        <Paragraph className="osc-resource-detail-content-item-status">
                          {resource.statuses
                            ?.map((s: { label: string }) => s.label)
                            ?.join(',')}
                        </Paragraph>
                      </div>
                    }
                  />
                )}
              />
            )}

            {displayTitle && resource.title && (
              <Heading4>{resource.title}</Heading4>
            )}
            <div className="osc-resource-detail-content-item-row">
              {displayUser && resource?.user?.name && (
                <div>
                  <Heading6 className="osc-resource-detail-content-item-title">
                    Naam
                  </Heading6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.user.name}
                  </span>
                </div>
              )}
              {displayDate && resource.startDateHumanized && (
                <div>
                  <Heading6 className="osc-resource-detail-content-item-title">
                    Datum
                  </Heading6>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.startDateHumanized}
                  </span>
                </div>
              )}
              {displayBudget && resource.budget && (
                <div>
                  <Heading6 className="osc-resource-detail-content-item-title">
                    Budget
                  </Heading6>
                  <span className="osc-resource-detail-content-item-text">
                    {`€ ${resource.budget.toLocaleString('nl-NL')}`}
                  </span>
                </div>
              )}
            </div>
            <div>
              {displaySummary && <Heading5>{resource.summary}</Heading5>}
              {displayDescription && (
                <Paragraph>{resource.description}</Paragraph>
              )}
            </div>
            {displayLocation && resource.position && (
              <>
                <Heading4>Plaats</Heading4>
                <Paragraph className="osc-resource-detail-content-item-location">
                  {`${resource.position.lat}, ${resource.position.lng}`}
                </Paragraph>
              </>
            )}
          </article>
        ) : (
          <span>resource niet gevonden..</span>
        )}
      </section>

      {shouldHaveSideColumn ? (
        <section className="resource-detail-side-column">
          {displayLikes ? (
            <>
              <Likes {...props} />
              <Spacer size={1} />
            </>
          ) : null}

          <div className="resource-detail-side-section">
            <Heading4>Status</Heading4>
            <Spacer size={0.5} />
            <div className="resource-detail-pil-list-content">
              {resource.statuses?.map((s: { label: string }) => (
                <Pill light rounded text={s.label}></Pill>
              ))}
            </div>

            <Spacer size={2} />
          </div>

          {displayTags ? (
            <div className="resource-detail-side-section">
              <Heading4>Tags</Heading4>
              <Spacer size={0.5} />
              <div className="resource-detail-pil-list-content">
                {(resource.tags as Array<{ type: string; name: string }>)
                  ?.filter((t) => t.type !== 'status')
                  ?.map((t) => <Pill text={t.name} />)}
              </div>
              <Spacer size={2} />
            </div>
          ) : null}

          {displaySocials ? (
            <div className="resource-detail-side-section">
              <Heading4>Deel dit</Heading4>
              <Spacer size={0.5} />
              <div className="resource-detail-side-section-socials">
                <IconButton
                  onClick={() => {}}
                  // className="subtle-button"
                  icon="ri-facebook-fill"
                />

                <IconButton
                  onClick={() => {}}
                  // className="subtle-button"
                  icon="ri-whatsapp-fill"
                />

                <IconButton
                  onClick={() => {}}
                  // className="subtle-button"
                  icon="ri-twitter-x-fill"
                />

                <IconButton
                  onClick={() => {}}
                  // className="subtle-button"
                  icon="ri-mail-fill"
                />

                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(location.href);
                  }}
                  // className="subtle-button"
                  icon="ri-link"
                />

                <IconButton
                  onClick={() => {}}
                  // className="subtle-button"
                  icon="ri-linkedin-fill"
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
