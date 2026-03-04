import fs from "fs";
import { get_channel, host } from "./arena.js";

fetch(host + "/channels/" + "projects-hlemx_lvnvw")
	.then((res) => res.json())
	.then(async (channel) => {
		let projects = [];
		let projects_fetch = channel.contents;

		for (let i = 0; i < projects_fetch.length; i++) {
			await get_channel(projects_fetch[i].id).then((res) => {
				console.log(res.title);
				projects.push(res);
			});
		}

		fs.writeFileSync("./data.json", JSON.stringify(projects, null, 2));
	});
