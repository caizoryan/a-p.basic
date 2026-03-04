import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";

let items = [
	// ["h4", "Index"],
	// ["h4", "About"],
	// ["h4", "Work"],
];

let init = (channels) => {
	channels = channels.reverse();

	let slideshow = dom([".slideshow"]);
	// 	.sort((a, b) => Math.random() > .5 ? 1 : -1)
	// 	.sort((a, b) => Math.random() > .5 ? 1 : -1)
	// 	.sort((a, b) => Math.random() > .5 ? 1 : -1)
	// 	.sort((a, b) => Math.random() > .5 ? 1 : -1)
	// 	.sort((a, b) => Math.random() > .5 ? 1 : -1);
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

		project.push([".meta", boxed(["h4", e.title.slice(2)])]);

		if (e.contents) {
			let count = 0;
			let till = 0;
			// Math.floor(Math.random() * 4) + 2;
			e.contents.reverse().forEach((e) => {
				if (count > till) return;
				if (e.class == "Image") {
					count++;
					project.push([".img-container", ["img", {
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
					project.push([".img-container", ["video", {
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

		items.push(project);
	});

	let div = dom(
		".root",
		// slideshow,
		[".bar", "Index", "About", "Work"],
		[".projects", ...items],
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
		connectionPoint(-6, -6),
		connectionPoint(width / 2 - 6, -6),
		connectionPoint(-6, height / 2 - 6),

		connectionPoint(width - 6, height / 2 - 6),
		connectionPoint(width / 2 - 6, height - 6),

		connectionPoint(width - 6, height - 6),
		connectionPoint(-6, height - 6),
		connectionPoint(width - 6, -6),
	];

	return connectionPoints;
};

let boxed = (c) => [".boxed", c, ...connectors(250, 55)];
