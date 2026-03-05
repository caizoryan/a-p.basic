import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";
import { MD } from "./md.js";

let items = [
	// ["h4", "Index"],
	// ["h4", "About"],
	// ["h4", "Work"],
];

let size = reactive("s");
let empty = [[".empty"]];
let page = reactive(empty);
let scroll = reactive(0);
page.subscribe((e) => {
	if (e == empty) scroll.next(0);
});

let scroller;
scroll.subscribe((e) => {
	let w = scroller.getBoundingClientRect().width;
	let scrollWidth = scroller.scrollWidth;
	let to = e * w;
	if (to > scrollWidth) scroll.next((e) => e - .5);
	else if (to < 0) scroll.next(0);
	else scroller.scrollLeft = to;
});

let init = (channels) => {
	channels = channels.reverse();

	let slideshow = dom([".slideshow"]);
	scroller = dom([".scroller", page]);
	let mainPage = dom([".page", {
		open: memo(() => page.value() != empty ? "true" : "false", [
			page,
		]),
	}, [
			".buttons",
			["button", { onclick: () => page.next(empty) }, "close"],
			["button", { onclick: () => scroll.next((e) => e - .5) }, "←"],
			["button", { onclick: () => scroll.next((e) => e + .5) }, "→"],
		], scroller]);

	channels.forEach((e) => {
		if (!e.title) return;
		let slide;
		let projectContents = [];
		let project = [".project", {
			onclick: () => {
				console.log(projectContents);
				page.next([...projectContents]);
			},
			onmouseover: (e) => {
				slideshow.innerHTML = "";
				slideshow.appendChild(slide);
			},

			onmouseleave: () => {
				slideshow.innerHTML = "";
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
						src: e.image.display.url,
					}]]);
					slide = dom(["img", { src: e.image.display.url }]);
				}

				if (
					e.class == "Attachment"
					// && e.attachment.extension == "mp4"
				) {
					console.log(e);
					count++;
					imgs.push([".img-container", ["video", {
						src: e.attachment.url,
						autoplay: true,
						muted: true,
						loop: true,
					}]]);

					slide = dom(["video", {
						src: e.attachment.url,
						autoplay: true,
						muted: true,
						loop: true,
					}]);
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
	) => ["a", { href: link, target: "_blank" }, text];

	let links = [
		link("https://writing.a-p.space", "Writing"),
		link("https://feed.a-p.space", "Feed"),
		link("https://www.are.na/aaryan-pashine/index", "Are.na"),
		link("https://github.com/caizoryan", "Github"),
		link("https://www.instagram.com/a____p.jpg/", "Instagram"),
	];

	let tags = ["Websites", "Publications", "Posters", "Campaigns"];

	let About = [".about", [
		"p",
		"Aaryan Pashine (me) is graphic designer and programmer based in Toronto, Canada. His work is focused on exploring new and alternative tools, interfaces, and processes to produce graphics.",
	], [
			"p",
			"You can also see what I'm upto on my ",
			link("https://feed.a-p.space", "Feed"),
			", I also do some ",
			link("https://writing.a-p.space", "Writing"),
			" and you can find me on ",
			link("https://www.are.na/aaryan-pashine/index", "Are.na"),
			", ",

			link("https://mastodon.social/@caizoryan", "Mastodon"),
			", ",
			link("https://github.com/caizoryan", "Github"),
			", or ",
			link("https://www.instagram.com/a____p.jpg/", "Instagram"),
		], [
			"p",
			" I make ",
			...tags.map((e) => ["button", e]),
		]];

	let Projects = [".projects", { size }, ...items];

	let div = dom(
		".root",
		About,
		controls,
		Projects,
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
