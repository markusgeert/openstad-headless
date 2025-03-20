const sanitize = require("sanitize-html");

const remoteURL = /^(?:\/\/)|(?:\w+?:\/{0,2})/;
const noTags = {
	allowedTags: [],
	allowedAttributes: [],
};
const allSafeTags = {
	allowedTags: [
		// Content sectioning
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"nav",
		"section",
		// Text content
		"center",
		"dd",
		"div",
		"dl",
		"dt",
		"figcaption",
		"figure",
		"hr",
		"li",
		"ol",
		"p",
		"pre",
		"ul",
		// Inline text semantics
		"a",
		"b",
		"big",
		"blockquote",
		"br",
		"cite",
		"code",
		"em",
		"i",
		"mark",
		"q",
		"s",
		"strike",
		"small",
		"span",
		"strong",
		"sub",
		"u",
		"var",
		// Demarcating edits
		"del",
		"ins",
		// Image and multimedia
		"audio",
		"img",
		"video",
		// Table content
		"caption",
		"col",
		"colgroup",
		"table",
		"tbody",
		"td",
		"tfoot",
		"th",
		"thead",
		"tr",
	],
	allowedAttributes: {
		"*": [
			"align",
			"alt",
			"bgcolor",
			"center",
			"class",
			"data-*",
			"name",
			"title",
		],
		a: ["href", "name", "rel", "target"],
		img: ["height", "src", "width"],
	},
	// allowedClasses: {
	// 	'p': [ 'fancy', 'simple' ]
	// },
	allowedSchemes: ["http", "https", "ftp", "mailto", "tel"],
	transformTags: {
		a: (tagName, attrs) => {
			if (attrs.href && remoteURL.test(attrs.href)) {
				attrs.target = "_blank";
				attrs.rel = "noreferrer noopener";
			}
			return { tagName: tagName, attribs: attrs };
		},
	},
};

module.exports = {
	title: (text) => {
		// TODO: de replace is natuurlijk belachelijk, maar ik heb nergens een combi kunnen vinden waarin sanatize en nunjucks dit fatsoenlijk oplossen. Ik denk dat de weergaven van title naar |safe moeten, want ze zijn toch gesanatized, maar daar heb ik nu geen tijd voor
		return sanitize(text, noTags).replace("&amp;", "&");
	},
	summary: (text) => sanitize(text, noTags),
	content: (text) => sanitize(text, allSafeTags),

	argument: (text) => sanitize(text, noTags),

	// TODO: Transform all call to these two options, instead
	//       of the content-type-named versions above.
	safeTags: (text) => sanitize(text, allSafeTags),
	noTags: (text) => sanitize(text, noTags),
};
