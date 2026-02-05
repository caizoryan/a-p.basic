// import { memo, reactive } from "./hok.js";
import { dom } from "./dom.js";

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

let projectggs = dom(["span.invisible", "GGGGGGGGGGG"]);
let init = (channel) => {
	projectggs.innerHTML = "";
	let projectEntry = (channel) =>
		dom("p.project", {
			onclick: () => {
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
			},
		}, channel.title.slice(2));

	let projs = channel
		.contents
		.map((e) => projectEntry(e));

	// TODO: Use this for something interesting
	// p.forEach((e) => projectggs.appendChild(e));
	projs.forEach((e) => project_list.appendChild(e));
};

let ignore = dom([".ignore"]);
let bar = dom(".bar.hindi", ["p", "काम"], ["p", "जानकारी"], ["p", "अन्यत्र"]);

let project_list = dom([".project-list"]);
let about = dom([
	".about",
	["h4.hindi", "जानकारी"],
	[
		"p",
		"Aaryan Pashine is a ",
		projectggs,
		"Graphic Design Student at ocad university, interested in exploring the intersection between code, design, distribution and materiality",
	],

	["h4.hindi", "काम"],
	project_list,

	["h4.hindi", "अन्यत्र"],
	["p", "Elsewhere"],
	["p", [
		"a",
		{ href: "https://feed.a-p.space", target: "_blank" },
		"feed.a-p.space",
	]],
	["p", [
		"a",
		{ href: "https://writing.a-p.space", target: "_blank" },
		"writing.a-p.space",
	]],
	["p", ["a", { href: "https://are.na/aaryan-pashine" }, "are.na"]],
	["p", ["a", { href: "https://mastodon.social/@caizoryan" }, "mastodon"]],
	["p", ["a", { href: "https://www.instagram.com/a____p.jpg/" }, "instagram"]],
]);
let projects;
let div = dom(
	".root",
	about,
	ignore,
	[".right"],
	bar,
);
document.body.appendChild(div);
