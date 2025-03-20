import {
	Parser as HtmlToReactParser,
	ProcessNodeDefinitions,
} from "html-to-react";
import React from "react";
import ReactDOMServer from "react-dom/server";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import {
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Link,
	OrderedList,
	OrderedListItem,
	Paragraph,
	Strong,
	UnorderedList,
	UnorderedListItem,
} from "@utrecht/component-library-react";

export default function RenderContent(content) {
	const htmlInput = `<div>${content}</div>`;

	const isValidNode = () => true;

	// Order matters. Instructions are processed in the order they're defined
	const processNodeDefinitions = new ProcessNodeDefinitions();
	const processingInstructions = [
		{
			shouldProcessNode: (node) => node?.name && node.name === "h1",
			processNode: (node, children, index) => (
				<Heading1 key={index}>{children}</Heading1>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "h2",
			processNode: (node, children, index) => (
				<Heading2 key={index}>{children}</Heading2>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "h3",
			processNode: (node, children, index) => (
				<Heading3 key={index}>{children}</Heading3>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "h4",
			processNode: (node, children, index) => (
				<Heading4 key={index}>{children}</Heading4>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "p",
			processNode: (node, children, index) => (
				<Paragraph key={index}>{children}</Paragraph>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "a",
			processNode: (node, children, index) => (
				<Link key={index} href={node.attribs.href} target={node.attribs.target}>
					{children}
				</Link>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "strong",
			processNode: (node, children, index) => (
				<Strong key={index}>{children}</Strong>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "ol",
			processNode: (node, children, index) => (
				<OrderedList key={index}>{children}</OrderedList>
			),
		},
		{
			shouldProcessNode: (node) =>
				node?.name && node.name === "li" && node.parent.name === "ol",
			processNode: (node, children, index) => (
				<OrderedListItem key={index}>{children}</OrderedListItem>
			),
		},
		{
			shouldProcessNode: (node) => node?.name && node.name === "ul",
			processNode: (node, children, index) => (
				<UnorderedList key={index}>{children}</UnorderedList>
			),
		},
		{
			shouldProcessNode: (node) =>
				node?.name && node.name === "li" && node.parent.name === "ul",
			processNode: (node, children, index) => (
				<UnorderedListItem key={index}>{children}</UnorderedListItem>
			),
		},
		{
			shouldProcessNode: (node) => true,
			processNode: processNodeDefinitions.processDefaultNode,
		},
	];
	const htmlToReactParser = new HtmlToReactParser();
	const reactComponent = htmlToReactParser.parseWithInstructions(
		htmlInput,
		isValidNode,
		processingInstructions,
	);

	return ReactDOMServer.renderToStaticMarkup(reactComponent).substring(
		5,
		ReactDOMServer.renderToStaticMarkup(reactComponent).length - 6,
	);
}
