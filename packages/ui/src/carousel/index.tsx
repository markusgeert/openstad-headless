import type React from "react";
import { useEffect, useState } from "react";
import "../index.css";
import "./index.css";
import { IconButton } from "../iconbutton";

type Props = {
	items: Array<any>;
	itemRenderer: (item: any) => React.JSX.Element;
	startIndex?: number;
	previousButton?: HTMLButtonElement;
	nextButton?: HTMLButtonElement;
	buttonText?: {
		next?: string;
		previous?: string;
	};
	beforeIndexChange?: () => void;
	setIndexInParent?: (setter: (index: number) => void) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function Carousel({
	startIndex = 0,
	items = [],
	itemRenderer,
	buttonText,
	beforeIndexChange = () => {},
	setIndexInParent = () => {},
	...props
}: Props) {
	const [index, setIndex] = useState<number>(startIndex);

	if (items.length === 0) return null;

	useEffect(() => {
		if (setIndexInParent) {
			setIndexInParent(() => setIndex);
		}
	}, [setIndexInParent]);

	const handleIndexChange = (newIndex: number) => {
		if (beforeIndexChange) {
			beforeIndexChange();
		}

		setIndex(newIndex);
	};

	return (
		<div {...props} className={`osc ${props.className} osc-carousel width-100`}>
			{items.length > 1 && (
				<div className="carousel-button-container">
					<div className="osc-carousel-navigation-button-wrapper osc-carousel-previous">
						<IconButton
							className="primary-action-button"
							icon="ri-arrow-left-s-line"
							disabled={index === 0}
							text={buttonText?.previous || "Vorige slide"}
							iconOnly={true}
							onClick={() => handleIndexChange(index - 1)}
						/>
					</div>
					<div className="osc-carousel-navigation-button-wrapper osc-carousel-next">
						<IconButton
							className="primary-action-button"
							icon="ri-arrow-right-s-line"
							disabled={index === items.length - 1}
							text={buttonText?.next || "Volgende slide"}
							iconOnly={true}
							onClick={() => handleIndexChange(index + 1)}
						/>
					</div>
				</div>
			)}

			<div className="carousel-items">{itemRenderer(items.at(index))}</div>
		</div>
	);
}
