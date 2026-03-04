import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";

let items = [
	// ["h4", "Index"],
	// ["h4", "About"],
	// ["h4", "Work"],
];

let init = (channels) => {
	channels = channels
		.sort((a, b) => Math.random() > .5 ? 1 : -1)
		.sort((a, b) => Math.random() > .5 ? 1 : -1)
		.sort((a, b) => Math.random() > .5 ? 1 : -1)
		.sort((a, b) => Math.random() > .5 ? 1 : -1)
		.sort((a, b) => Math.random() > .5 ? 1 : -1);
	channels.forEach((e) => {
		if (!e.title) return;

		if (e.contents) {
			let count = 0;
			let till = 0;
			// Math.floor(Math.random() * 4) + 2;
			e.contents.reverse().forEach((e) => {
				if (count > till) return;
				if (e.class == "Image") {
					count++;
					items.push([".img-container", ["img", { src: e.image.thumb.url }]]);
				}

				if (
					e.class == "Attachment"
					// && e.attachment.extension == "mp4"
				) {
					console.log(e);
					count++;
					items.push([".img-container", ["video", {
						src: e.attachment.url,
						autoplay: true,
						muted: true,
					}]]);
				}
			});
		}
	});

	let div = dom(
		".root",
		...items,
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
		}, "x");
	};

	let connectionPoints = [
		connectionPoint(-6, -6),
		connectionPoint(width, height),
		connectionPoint(-6, height),
		connectionPoint(width, -6),
	];

	return connectionPoints;
};

let boxed = (c) => [".boxed", ...c, ...connectors(80, 15)];
