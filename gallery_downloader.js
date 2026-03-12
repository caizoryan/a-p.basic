import fs from "fs";
import { get_channel, get_channel_contents, host } from "./arena.js";

fetch(host + "/channels/" + "projects-hlemx_lvnvw/contents?sort=position_desc&per=60")
	.then((res) => res.json())
	.then(async (channel) => {
		console.log(channel)
		let projects = [];
		let projects_fetch = channel.data;
		let tags = { 
			plus: {},
			tags: { All: []} 
		};

		for (let i = 0; i < projects_fetch.length; i++) {
			let cur = projects_fetch[i]
			await get_channel_contents(cur.id).then((res) => {
				if (cur.title.includes("[TAG]")) {
					let tag = cur.title.replace("[TAG] ", "");
					console.log(cur.title);
					if (!res.data) {
						console.log("NO DATA",res)
					}
					tags.tags[tag] = res.data.map((e) => e.slug);
				} else if (cur.title.includes("[+TAG]")) {
					let tag = cur.title.replace("[+TAG] ", "");
					console.log(cur.title);
					if (!res.data) {
						console.log("NO DATA",res)
					}
					tags.plus[tag] = res.data.map((e) => e.slug);
				} else {
					console.log(cur.title);
					tags.tags.All.push(cur.slug);
					projects.push({...cur, contents: res.data});
				}
			});
		}

		fs.writeFileSync("./data.json", JSON.stringify(projects, null, 2));
		fs.writeFileSync("./tags.json", JSON.stringify(tags, null, 2));
	});
