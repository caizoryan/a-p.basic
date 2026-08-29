import { dom } from "./dom.js";
import { memo, reactive } from "./hok.js";
import { MD } from "./md.js";

let items = [];
let tagData = {};
let plusTagData = {};
let plusOpen = reactive(false)

let tag = reactive("");
let size = reactive("m");
let empty = [[".empty"]];
let page = reactive(empty);

try {
	await fetch("./tags.json").then((res) => res.json())
		.then((res) => {
		plusTagData = res.plus
		tagData = res.tags
	});
} catch {
	console.log("Error");
}

let src = reactive("");
let vidsrc = reactive("");
let imageViewerOpen = memo(() => {
	if (src.value() != "") return true;
	if (vidsrc.value() != "") return true;
	else return false;
}, [
	src,
	vidsrc,
]);
let imageViewer = dom([
	".image-full",
	{ open: imageViewerOpen },
	[".overlay", {
		open: imageViewerOpen,
		onclick: () => {
			src.next("");
			vidsrc.next("");
		},
	}],
	["img", {
		src,
		style: memo(
			() => src.value() == "" ? "display: none;" : "display:block;",
			[src],
		),
	}],
	["video", {
		style: memo(
			() => vidsrc.value() == "" ? "display: none;" : "display:block;",
			[vidsrc],
		),
		src: vidsrc,
		controls: "",
		muted: "",
		autoplay: "",
	}],
]);

let init = (channels) => {
	// channels = channels.reverse();

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
		let plusTags = []
		console.log(e.slug)
		Object.entries(tagData).forEach(([key, value]) => {
			if (value.includes(e.slug)) projectTags.push(key);
		});

		Object.entries(plusTagData).forEach(([key, value]) => {
			if (value.includes(e.slug)) plusTags.push(key);
		});

		let tagged = memo(() => {
			if (plusTags.length > 0 && !plusOpen.value()) return false
			else if (tag.value() == "") return true;
			else {
				let ret = false;
				projectTags.forEach((e) => {
					if (tag.value() == e) ret = true;
				});
				plusTags.forEach(e => {
					if (tag.value() == e) ret = true;
				})
				return ret;
			}
		}, [tag, plusOpen]);

		let project = [".project", {
			tagged,
			onclick: () => {
				page.next([...projectContents]);
			},
		}];


		let imgs = [];
		let textContents = [];
		let fullImageContents = [];
		if (e.contents) {
			let count = 0;
			let till = 10;
			// Math.floor(Math.random() * 4) + 2;
			e.contents
				// .reverse()
				.forEach((e) => {
				if (count > till) return;
				if (e.title && e.title == ".ignore") return;
				if (e.type == "Text") {
					let text = [".text-container", ...MD(e.content.markdown)];
					textContents.push(text);
					imgs.push(text);
				}
				if (e.type == "Image") {
					count++;
					let image = [".img-container", ["img", {
						onclick: () => {
							src.next(e.image.src);
							vidsrc.next("");
						},
						loading: "lazy",
						src: e.image.large.src,
					}]];
					imgs.push(image);

					let fullImage = [".full-project-image", image];
					if (e.description) {
						fullImage.push([".caption", e.description]);
					}
					fullImageContents.push(fullImage);
				}

				if (
					e.type == "Attachment"
					// && e.attachment.extension == "mp4"
				) {
					count++;
					let video = [".img-container", ["video", {
						onclick: () => {
							vidsrc.next(e.attachment.url);
						},
						loading: "lazy",
						"webkit-playsinline": true,
						playsinline: true,
						src: e.attachment.url,
						autoplay: '',
						muted: '',
						loop: '',
					}] ];
					imgs.push(video);
					fullImageContents.push([".full-project-image", video]);
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

		projectContents = [
			".full-project",
			[".full-project-text", ...textContents],
			[".full-project-images", ...fullImageContents],
		];

		project.push(imgMemo);

		project.push([ ".meta", ["h4", e.title.slice(2)]]);
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
		// control("xs", "X"),
		control("s", "SML"),
		control("m", "MED"),
		control("xl", "LRG"),
		// control("xl", "X"),
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
		// [
		// 	"p.small",
		// 	"You can also see what I'm upto on my ",
		// 	link("https://feed.a-p.space", "Feed"),
		// ],
		// [
		// 	"p.small",
		// 	"I sometimes ",
		// 	link("https://writing.a-p.space", "write stuff"),
		// ],
		// [
		// 	"p.small",
		// 	link("https://www.are.na/aaryan-pashine/index", "Are.na", ".heart"),
		// 	"/ ",
		//
		// 	link("mailto:pashineaaryan@gmail.com", "Email"),
		// 	"/ ",
		//
		// 	link("https://mastodon.social/@caizoryan", "Mastodon"),
		// 	"/ ",
		// 	link("https://github.com/caizoryan", "Github"),
		// 	"/ ",
		// 	link("https://www.instagram.com/a____p.jpg/", "Instagram", ".boo"),
		// ],
		// [
		// 	"p.tags",
		// 	...Object.keys(tagData).map((e) => ["button", {
		// 		selected: memo(() => tag.value() == e, [tag]),
		// 		onclick: () => {
		// 			if (tag.value() == e) tag.next("");
		// 			else tag.next(e);
		// 		},
		// 	}, e]),
		//
		// 	["button", {
		// 		onclick: () => plusOpen.next(e => !e),
		// 		selected: memo(() => plusOpen.value() ? 'true' : 'false',[plusOpen])
		// 	},
		// 		memo(() => plusOpen.value() ? 'x' : '+',[plusOpen])
		// 	],
		//
		// 	memo(() => plusOpen.value() ? Object.keys(plusTagData).map(e => 
		// 	['button', {
		// 		onclick: () => {
		// 			if (tag.value() == e) tag.next("");
		// 			else tag.next(e);
		// 		}
		// 	}, e]
		// 	) : [['span', '']], [plusOpen])
		// ],
	];
let Projects = [".projects", { size }, ...items];

	let div = dom(
		".root",
		['.bar', 
		['p.tags', 
			link("mailto:pashineaaryan@gmail.com", "Email"),
		 	link("https://feed.a-p.space", "Feed"),
			link("https://writing.a-p.space", "Writing"),
			link("https://www.are.na/aaryan-pashine/index", "Are.na", ".heart"),
			// link("https://mastodon.social/@caizoryan", "Mastodon"),
			link("https://github.com/caizoryan", "Github"),
			link("https://www.instagram.com/a____p.jpg/", "Instagram", ".boo"),
		]],
		About,
		// controls,
		Projects,
		[".overlay", {
			open,
			onclick: () => {
				console.log("clicked");
				page.next(empty);
			},
		}],
		imageViewer,
		mainPage,
	);
	document.body.appendChild(div);

	// Interactive SVG line replacing border-top on .about
	initAboutLine();
};

function initAboutLine() {
	let aboutEl = document.querySelector('.about');
	if (!aboutEl) return;

	const SVG_NS = "http://www.w3.org/2000/svg";
	const NUM_POINTS = 40;
	const MAX_RAISE = 180;
	const RANGE = 280; // px
	const LERP_SPEED = 0.08;
	const SVG_HEIGHT = 60;
	const BASELINE_Y = SVG_HEIGHT; // bottom of SVG

	let svg = document.createElementNS(SVG_NS, "svg");
	svg.classList.add("about-line-svg");
	svg.setAttribute("height", SVG_HEIGHT);
	aboutEl.prepend(svg);

	let points = [];
	let polyline = document.createElementNS(SVG_NS, "polyline");
	svg.appendChild(polyline);

	for (let i = 0; i < NUM_POINTS; i++) { points.push({ x: 0, currentY: BASELINE_Y, targetY: BASELINE_Y }); }
	function layout() {
		let w = svg.getBoundingClientRect().width || svg.parentElement.clientWidth;
		svg.setAttribute("width", w);
		for (let i = 0; i < NUM_POINTS; i++) {
			points[i].x = (i / (NUM_POINTS - 1)) * w;
		}
	}

	layout();
	window.addEventListener("resize", layout);

	let mouseX = -9999;
	let mouseY = -9999;
	let rafId = null;

	function onMouseMove(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		if (!rafId) rafId = requestAnimationFrame(tick);
	}

	function tick() {
		let rect = svg.getBoundingClientRect();
		let localMouseX = mouseX - rect.left;
		let localMouseY = mouseY - rect.top;

		let verticallyNear = localMouseY >= (rect.height - RANGE) && localMouseY <= rect.height;
		let verticalDist = rect.height - localMouseY;
		let effectiveMaxRaise = Math.min(verticalDist, MAX_RAISE);

		let needsUpdate = false;

		for (let i = 0; i < points.length; i++) {
			let p = points[i];

			if (verticallyNear) {
				let dist = Math.abs(localMouseX - p.x);
				if (dist < RANGE) {
					let t = dist / RANGE;
					let factor = Math.exp(-5 * t * t);
					p.targetY = BASELINE_Y - (effectiveMaxRaise * factor);
				} else {
					p.targetY = BASELINE_Y;
				}
			} else {
				p.targetY = BASELINE_Y;
			}

			p.currentY += (p.targetY - p.currentY) * LERP_SPEED;

			if (Math.abs(p.currentY - p.targetY) > 0.1) {
				needsUpdate = true;
			}
		}

		let pointsStr = points.map(p => `${p.x},${p.currentY}`).join(" ");
		polyline.setAttribute("points", pointsStr);

		// for (let i = 0; i < points.length; i++) {
		// 	circles[i].setAttribute("cx", points[i].x);
		// 	circles[i].setAttribute("cy", points[i].currentY);
		// }

		if (needsUpdate) {
			rafId = requestAnimationFrame(tick);
		} else {
			rafId = null;
		}
	}

	window.addEventListener("mousemove", onMouseMove);

	// Initial draw
	tick();
}

fetch("./data.json")
	.then((res) => res.json())
	.then(init);

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
