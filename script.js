import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";

let items = [
	// ["h4", "Index"],
	// ["h4", "About"],
	// ["h4", "Work"],
];

let size = reactive("s");
let init = (channels) => {
	channels = channels.reverse();

	let slideshow = dom([".slideshow"]);

	channels.forEach((e) => {
		if (!e.title) return;
		let slide;
		let project = [".project", {
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
			() => size.value() == "xl" ? imgs.slice(0, 5) : imgs.slice(0, 1),
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

	let div = dom(
		".root",
		[".about", [
			"p",
			"Aaryan Pashine is a Graphic Designer and Programmer based in Toronto, Canada.",
		], [".links", ["h4", "Links"], [
			"p",
			"Instagram",
		], ["p", "Are.na"]]],
		controls,
		[".projects", { size }, ...items],
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
