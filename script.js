import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";
import { MD } from "./md.js";

let items = [];
let tagData = {};

let tag = reactive("");
let size = reactive("s");
let empty = [[".empty"]];
let page = reactive(empty);

try {
	await fetch("./tags.json").then((res) => res.json())
		.then((res) => tagData = res);
} catch {
	console.log("Error");
}

let init = (channels) => {
	channels = channels.reverse();

	let open = memo(() => page.value() != empty ? "true" : "false", [page]);

	let mainPage = dom([
		".page",
		{
			open,
		},
		[
			".buttons",
			["button", { onclick: () => page.next(empty) }, "close"],
			// ["button", { onclick: () => scroll.next((e) => e - .5) }, "←"],
			// ["button", { onclick: () => scroll.next((e) => e + .5) }, "→"],
		],
		[".scroller", page],
	]);

	channels.forEach((e) => {
		if (!e.title) return;
		let projectContents = [];
		let projectTags = [];
		Object.entries(tagData).forEach(([key, value]) => {
			if (value.includes(e.slug)) projectTags.push(key);
		});
		let tagged = memo(() => {
			if (tag.value() == "") return true;
			else {
				let ret = false;
				projectTags.forEach((e) => {
					if (tag.value() == e) ret = true;
				});
				return ret;
			}
		}, [tag]);

		let project = [".project", {
			tagged,
			onclick: () => {
				page.next([...projectContents]);
			},
		}];

		project.push([
			".meta", // boxed(["h4", e.title.slice(2)]),
			["h4", e.title.slice(2)],
		]);

		let imgs = [];
		if (e.contents) {
			let count = 0;
			let till = 4;
			// Math.floor(Math.random() * 4) + 2;
			e.contents.reverse().forEach((e) => {
				if (count > till) return;
				if (e.class == "Text") {
					imgs.push([".text-container", ...MD(e.content)]);
				}
				if (e.class == "Image") {
					count++;
					imgs.push([".img-container", ["img", {
						loading: "lazy",
						src: e.image.display.url,
					}]]);
				}

				if (
					e.class == "Attachment"
					// && e.attachment.extension == "mp4"
				) {
					count++;
					imgs.push([".img-container", ["video", {
						loading: "lazy",
						"webkit-playsinline": true,
						playsinline: true,
						src: e.attachment.url,
						autoplay: true,
						muted: true,
						loop: true,
					}]]);
				}
			});
		}

		let imgMemo = memo(
			() =>
				size.value() == "xl"
					? imgs.slice(0, 5)
					: imgs.filter((e) => e[0] != ".text-container").slice(0, 1),
			[size],
		);

		projectContents = imgs;

		project.push(imgMemo);
		items.push(project);
	});

	let control = (
		key,
		text,
	) => ["button", {
		onclick: () => size.next(key),
		active: memo(() => key == size.value(), [size]),
	}, text];

	let controls = [
		".buttons",
		control("xs", "X"),
		control("s", "SML"),
		control("m", "MED"),
		control("l", "LRG"),
		control("xl", "X"),
	];

	let link = (
		link,
		text,
		boo = "",
	) => ["a.link" + boo, { href: link, target: "_blank" }, text];

	let About = [
		".about",
		[
			"p.big",
			"Aaryan Pashine ← me → is a graphic designer and programmer based in Toronto, Canada. His work is focused on exploring new and alternative tools, interfaces, and processes to produce graphics.",
		],
		[
			"p.small",
			"You can also see what I'm upto on my ",
			link("https://feed.a-p.space", "Feed"),
		],
		[
			"p.small",
			"I sometimes ",
			link("https://writing.a-p.space", "write stuff"),
		],
		[
			"p.small",
			" Also on ",
			link("https://www.are.na/aaryan-pashine/index", "Are.na", ".heart"),
			"/ ",

			link("https://mastodon.social/@caizoryan", "Mastodon"),
			"/ ",
			link("https://github.com/caizoryan", "Github"),
			"/ ",
			link("https://www.instagram.com/a____p.jpg/", "Instagram", ".boo"),
		],
		[
			"p.tags",
			...Object.keys(tagData).map((
				e,
			) => [
					"button",
					{
						selected: memo(() => tag.value() == e, [tag]),
						onclick: () => {
							if (tag.value() == e) {
								tag.next("");
							} else tag.next(e);
						},
					},
					e,
				]),
		],
	];

	let Projects = [".projects", { size }, ...items];

	let div = dom(
		".root",
		About,
		controls,
		Projects,
		[".overlay", { open }],
		mainPage,
	);
	document.body.appendChild(div);
};

fetch("./data.json").then((res) => res.json()).then(init);

export const CSSTransform = (x, y, width, height) => {
	let v = `
		position: absolute;
		left: ${x}px;
		top: ${y}px;`;

	if (width != undefined) v += `width: ${width}px;`;
	if (height != undefined) v += `height: ${height}px;`;

	return v;
};

export const connectors = (width, height) => {
	let unwrapFn = (v) => typeof v == "function" ? v() : v;

	let connectionPoint = (x, y) => {
		return dom(".box", {
			style: CSSTransform(unwrapFn(x), unwrapFn(y)),
		}, " ");
	};

	let connectionPoints = [
		connectionPoint(-5, -5),
		connectionPoint(width / 2 - 5, -5),
		connectionPoint(-5, height / 2 - 5),

		connectionPoint(width - 5, height / 2 - 5),
		connectionPoint(width / 2 - 5, height - 5),

		connectionPoint(width - 5, height - 5),
		connectionPoint(-5, height - 5),
		connectionPoint(width - 5, -5),
	];

	return connectionPoints;
};

let boxed = (c) => [".boxed", c, ...connectors(250, 55)];
