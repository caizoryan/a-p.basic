// import { memo, reactive } from "./hok.js";
import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";

// let host = "http://localhost:3000/api";
let host = "https://api.are.na/v2/";
let options = { headers: { cache: "no-store" } };

let channels = {};
const fetch_json = (link, options) =>
	fetch(link, options).then((r) => r.json());
const get_channel = (slug) => {
	if (channels[slug]) {
		return new Promise((resolve, reject) => {
			resolve(channels[slug]);
		});
	}
	console.log("getting", slug);
	return fetch_json(host + "/channels/" + slug + "?per=100", options).then(
		(res) => {
			channels[res.slug] = res;
			return res;
		},
	);
};

const get_block = (id) => fetch_json(host + "/blocks/" + id, options);
get_channel("projects-hlemx_lvnvw").then((res) => {
	init(res);
});

let open_project = (channel) => {
	get_channel(channel.slug).then((res) => {
		ignore.innerHTML = "";
		res.contents = res.contents.sort((a, b) => b.position - a.position);
		console.log("Contents ", res.contents);

		let head = dom("h4", channel.title.slice(2));
		ignore.appendChild(head);

		res.contents.forEach((block) => {
			if (block.class == "Text") {
				console.log(block.content_html);
				let img = dom(".text-container");
				img.innerHTML = block.content_html;
				ignore.appendChild(img);
			}
			if (block.class == "Image") {
				let img = dom(".img-container", ["img", {
					src: block.image.display.url,
				}]);
				ignore.appendChild(img);
			}
			if (block.class == "Attachment") {
				let img = dom(".img-container", ["video", {
					autoplay: true,
					muted: true,
					src: block.attachment.url,
				}]);
				ignore.appendChild(img);
			}
		});
	});
};

let projectEntry = (channel) =>
	dom(
		"p.project",
		{ onclick: () => open_project(channel) },
		channel.title.slice(2),
	);

let init = (channel) => {
	console.log(channel);
};

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

let width = reactive(window.innerWidth);
let columnCount = memo(() => {
	if (width.value() < 600) return 3;
	else if (width.value() < 900) return 4;
	else if (width.value() < 1100) return 5;
	else return 6;
}, [width]);

let colWidth = memo(() => width.value() / columnCount.value(), [
	columnCount,
	width,
]);

let rowHeight = reactive(window.innerHeight / 6);
let boxes = Array(100).fill(0).map((e, i) => {
	return {
		x: memo(() => (i % columnCount.value() * colWidth.value()), [colWidth]),
		y: memo(() => Math.floor(i / columnCount.value()) * rowHeight.value(), [
			columnCount,
			rowHeight,
		]),
		filled: Math.random() > .5,
	};
});

let items = ["Index", "About", "Work", "", "", "Brickhaus menu"];
let els = boxes
	.map((e, i) => {
		let item = items[i] || "";
		return ["div", {
			style: memo(() =>
				CSSTransform(
					e.x.value(),
					e.y.value(),
					colWidth.value(),
					rowHeight.value(),
				) + (item != "" ? "background-color: white;" : ""), [
				e.x,
				e.y,
				colWidth,
				rowHeight,
			]),
		}, item];
	});

function changeSize() { }

window.onresize = (e) => {
	width.next(window.innerWidth);
	// height.next(window.innerHeight);
};

let div = dom(
	".root",
	...els,
	// ...boxes,
);
document.body.appendChild(div);
