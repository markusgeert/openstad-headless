import SelectorEngine from "../../../src/dom/selector-engine";

/** Test helpers */
import { clearFixture, getFixture } from "../../helpers/fixture";

describe("SelectorEngine", () => {
	let fixtureEl;

	beforeAll(() => {
		fixtureEl = getFixture();
	});

	afterEach(() => {
		clearFixture();
	});

	describe("find", () => {
		it("should find elements", () => {
			fixtureEl.innerHTML = "<div></div>";

			const div = fixtureEl.querySelector("div");

			expect(SelectorEngine.find("div", fixtureEl)).toEqual([div]);
		});

		it("should find elements globaly", () => {
			fixtureEl.innerHTML = '<div id="test"></div>';

			const div = fixtureEl.querySelector("#test");

			expect(SelectorEngine.find("#test")).toEqual([div]);
		});

		it("should handle :scope selectors", () => {
			fixtureEl.innerHTML = `<ul>
        <li></li>
        <li>
          <a href="#" class="active">link</a>
        </li>
        <li></li>
      </ul>`;

			const listEl = fixtureEl.querySelector("ul");
			const aActive = fixtureEl.querySelector(".active");

			expect(SelectorEngine.find(":scope > li > .active", listEl)).toEqual([
				aActive,
			]);
		});
	});

	describe("findOne", () => {
		it("should return one element", () => {
			fixtureEl.innerHTML = '<div id="test"></div>';

			const div = fixtureEl.querySelector("#test");

			expect(SelectorEngine.findOne("#test")).toEqual(div);
		});
	});

	describe("children", () => {
		it("should find children", () => {
			fixtureEl.innerHTML = `<ul>
        <li></li>
        <li></li>
        <li></li>
      </ul>`;

			const list = fixtureEl.querySelector("ul");
			const liList = [].concat(...fixtureEl.querySelectorAll("li"));
			const result = SelectorEngine.children(list, "li");

			expect(result).toEqual(liList);
		});
	});

	describe("parents", () => {
		it("should return parents", () => {
			expect(SelectorEngine.parents(fixtureEl, "body").length).toEqual(1);
		});
	});

	describe("prev", () => {
		it("should return previous element", () => {
			fixtureEl.innerHTML =
				'<div class="test"></div><button class="btn"></button>';

			const btn = fixtureEl.querySelector(".btn");
			const divTest = fixtureEl.querySelector(".test");

			expect(SelectorEngine.prev(btn, ".test")).toEqual([divTest]);
		});

		it("should return previous element with an extra element between", () => {
			fixtureEl.innerHTML = [
				'<div class="test"></div>',
				"<span></span>",
				'<button class="btn"></button>',
			].join("");

			const btn = fixtureEl.querySelector(".btn");
			const divTest = fixtureEl.querySelector(".test");

			expect(SelectorEngine.prev(btn, ".test")).toEqual([divTest]);
		});

		it("should return previous element with comments or text nodes between", () => {
			fixtureEl.innerHTML = [
				'<div class="test"></div>',
				'<div class="test"></div>',
				"<!-- Comment-->",
				"Text",
				'<button class="btn"></button>',
			].join("");

			const btn = fixtureEl.querySelector(".btn");
			const divTest = fixtureEl.querySelectorAll(".test")[1];

			expect(SelectorEngine.prev(btn, ".test")).toEqual([divTest]);
		});
	});

	describe("next", () => {
		it("should return next element", () => {
			fixtureEl.innerHTML =
				'<div class="test"></div><button class="btn"></button>';

			const btn = fixtureEl.querySelector(".btn");
			const divTest = fixtureEl.querySelector(".test");

			expect(SelectorEngine.next(divTest, ".btn")).toEqual([btn]);
		});

		it("should return next element with an extra element between", () => {
			fixtureEl.innerHTML = [
				'<div class="test"></div>',
				"<span></span>",
				'<button class="btn"></button>',
			].join("");

			const btn = fixtureEl.querySelector(".btn");
			const divTest = fixtureEl.querySelector(".test");

			expect(SelectorEngine.next(divTest, ".btn")).toEqual([btn]);
		});

		it("should return next element with comments or text nodes between", () => {
			fixtureEl.innerHTML = [
				'<div class="test"></div>',
				"<!-- Comment-->",
				"Text",
				'<button class="btn"></button>',
				'<button class="btn"></button>',
			].join("");

			const btn = fixtureEl.querySelector(".btn");
			const divTest = fixtureEl.querySelector(".test");

			expect(SelectorEngine.next(divTest, ".btn")).toEqual([btn]);
		});
	});

	describe("focusableChildren", () => {
		it("should return only elements with specific tag names", () => {
			fixtureEl.innerHTML = [
				"<div>lorem</div>",
				"<span>lorem</span>",
				"<a>lorem</a>",
				"<button>lorem</button>",
				"<input />",
				"<textarea></textarea>",
				"<select></select>",
				"<details>lorem</details>",
			].join("");

			const expectedElements = [
				fixtureEl.querySelector("a"),
				fixtureEl.querySelector("button"),
				fixtureEl.querySelector("input"),
				fixtureEl.querySelector("textarea"),
				fixtureEl.querySelector("select"),
				fixtureEl.querySelector("details"),
			];

			expect(SelectorEngine.focusableChildren(fixtureEl)).toEqual(
				expectedElements,
			);
		});

		it("should return any element with non negative tab index", () => {
			fixtureEl.innerHTML = [
				"<div tabindex>lorem</div>",
				'<div tabindex="0">lorem</div>',
				'<div tabindex="10">lorem</div>',
			].join("");

			const expectedElements = [
				fixtureEl.querySelector("[tabindex]"),
				fixtureEl.querySelector('[tabindex="0"]'),
				fixtureEl.querySelector('[tabindex="10"]'),
			];

			expect(SelectorEngine.focusableChildren(fixtureEl)).toEqual(
				expectedElements,
			);
		});

		it("should return not return elements with negative tab index", () => {
			fixtureEl.innerHTML = ['<button tabindex="-1">lorem</button>'].join("");

			const expectedElements = [];

			expect(SelectorEngine.focusableChildren(fixtureEl)).toEqual(
				expectedElements,
			);
		});

		it("should return contenteditable elements", () => {
			fixtureEl.innerHTML = ['<div contenteditable="true">lorem</div>'].join(
				"",
			);

			const expectedElements = [
				fixtureEl.querySelector('[contenteditable="true"]'),
			];

			expect(SelectorEngine.focusableChildren(fixtureEl)).toEqual(
				expectedElements,
			);
		});

		it("should not return disabled elements", () => {
			fixtureEl.innerHTML = ['<button disabled="true">lorem</button>'].join("");

			const expectedElements = [];

			expect(SelectorEngine.focusableChildren(fixtureEl)).toEqual(
				expectedElements,
			);
		});

		it("should not return invisible elements", () => {
			fixtureEl.innerHTML = [
				'<button style="display:none;">lorem</button>',
			].join("");

			const expectedElements = [];

			expect(SelectorEngine.focusableChildren(fixtureEl)).toEqual(
				expectedElements,
			);
		});
	});
});
