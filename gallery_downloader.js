import fs from "fs";
import { get_channel, host } from "./arena.js";

fetch(host + "/channels/" + "projects-hlemx_lvnvw?per=60")
	.then((res) => res.json())
	.then(async (channel) => {
		let projects = [];
		let projects_fetch = channel.contents;
		let tags = {};

		for (let i = 0; i < projects_fetch.length; i++) {
			await get_channel(projects_fetch[i].id).then((res) => {
				console.log(projects_fetch[i].title);
				if (projects_fetch[i].title.includes("[TAG]")) {
					let tag = projects_fetch[i].title.replace("[TAG] ", "");
					tags[tag] = res.contents.map((e) => e.slug);
				} else projects.push(res);
			});
		}

		fs.writeFileSync("./data.json", JSON.stringify(projects, null, 2));
		fs.writeFileSync("./tags.json", JSON.stringify(tags, null, 2));
	});
