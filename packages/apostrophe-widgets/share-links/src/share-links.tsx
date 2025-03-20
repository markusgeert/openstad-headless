import React from "react";
import { createRoot } from "react-dom/client";

import "./share-links.css";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading4, LinkSocial } from "@utrecht/component-library-react";

interface Item {
	title: string;
}

function ShareLinks({ title }: Item) {
	return (
		<div className="share-links">
			<Heading4>{title}</Heading4>
			<div className="link-container">
				<LinkSocial
					external
					href={`http://www.facebook.com/share.php?u=${encodeURIComponent(location.href)}`}
					target="_blank"
					title={"Facebook"}
				>
					<i className="icon --facebook" />
					<span className="sr-only">Facebook</span>
				</LinkSocial>

				<LinkSocial
					external
					href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(location.href)}`}
					target="_blank"
					title={"X"}
				>
					<i className="icon --twitter" />
					<span className="sr-only">X</span>
				</LinkSocial>

				<LinkSocial
					external
					href={`mailto:?subject=${document.title}&body=${encodeURIComponent(location.href)}`}
					title={"Mail"}
				>
					<i className="icon --mail" />
					<span className="sr-only">Mail</span>
				</LinkSocial>

				<LinkSocial
					external
					href={`https://api.whatsapp.com/send?phone=&text=${encodeURIComponent(location.href)}&source=&data=`}
					target="_blank"
					title={"Whatsapp"}
				>
					<i className="icon --whatsapp" />
					<span className="sr-only">Whatsapp</span>
				</LinkSocial>

				<LinkSocial
					external
					href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}`}
					target="_blank"
					title={"LinkedIn"}
				>
					<i className="icon --linkedin" />
					<span className="sr-only">LinkedIn</span>
				</LinkSocial>

				<LinkSocial
					external
					title={"Kopieer link"}
					href={location.href}
					onClick={(e) => {
						e.preventDefault();
						navigator.clipboard.writeText(location.href);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							navigator.clipboard.writeText(location.href);
						}
					}}
					className="copy-link"
				>
					<i className="icon --url" />
					<span className="sr-only">Kopieer link</span>
				</LinkSocial>
			</div>
		</div>
	);
}

ShareLinks.loadWidgetOnElement = function (
	this: any,
	container: HTMLElement,
	props: any,
) {
	const Component = this;

	if (container) {
		const root = createRoot(container);
		root.render(<Component {...props} />);
	}
};

export { ShareLinks };
