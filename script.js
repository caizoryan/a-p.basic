import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";
import { MD } from "./md.js";

let items = [
	// ["h4", "Index"],
	// ["h4", "About"],
	// ["h4", "Work"],
];

let size = reactive("s");
let page = reactive("");

let init = (channels) => {
	channels = channels.reverse();

	let slideshow = dom([".slideshow"]);
	let mainPage = dom([".page", {
		open: memo(() => page.value() != "" ? "true" : "false", [page]),
	}, ["button", {
		onclick: () => page.next(""),
	}, "x"], ["h4", page]]);

	channels.forEach((e) => {
		if (!e.title) return;
		let slide;
		let project = [".project", {
			onclick: () => {
				page.next(e.slug);
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
	) => ["p", ["a", { href: link, target: "_blank" }, text]];

	let links = [
		".links",
		link("https://writing.a-p.space", "Writing"),
		link("https://feed.a-p.space", "Feed"),
		link("https://www.are.na/aaryan-pashine/index", "Are.na"),
		link("https://github.com/caizoryan", "Github"),
		link("https://www.instagram.com/a____p.jpg/", "Instagram"),
	];

	let About = [".about", [
		"p",
		"Aaryan Pashine is a Graphic Designer and Programmer based in Toronto, Canada.",
	], links];

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
