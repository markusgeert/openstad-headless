import React, { useState } from 'react';
import '../index.css';
import './index.css';
import { IconButton } from '../iconbutton';

type Props = {
  items: Array<any>;
  itemRenderer: (item: any) => React.JSX.Element;
  startIndex?: number;
  previousButton?: HTMLButtonElement;
  nextButton?: HTMLButtonElement;
} & React.HTMLAttributes<HTMLDivElement>;

export function Carousel({
  startIndex = 0,
  items = [],
  itemRenderer,
  ...props
}: Props) {
  const [index, setIndex] = useState<number>(startIndex);

  if (items.length === 0) return null;

  return (
    <div {...props} className={`osc ${props.className} osc-carousel`}>
      <div className="osc-carousel-navigation-button-wrapper">
        <IconButton
          className='primary-action-button'
          icon="ri-arrow-left-s-line"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        />
      </div>

      <div>{itemRenderer(items.at(index))}</div>

      <IconButton
          className='primary-action-button'
          icon="ri-arrow-right-s-line"
          disabled={index === items.length - 1}
          onClick={() => setIndex(index + 1)}
        />
    </div>
  );
}
