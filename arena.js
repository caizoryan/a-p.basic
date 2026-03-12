import { auth } from "./auth.js";

export let host = "https://api.are.na/v3/";
// export let host = "http://localhost:3000/api";

let options = { 
	headers: { 
		cache: "no-store" ,
		Authorization: `Bearer ${auth}`
	} 
};

let channels = {};

export const fetch_json = (link, options) =>
	fetch(link, options).then((r) => {
			try {
				let f = r.json()
				return f
			}
			catch {
				return {'error': "bruh"}
			}
	});

export const get_channel = (slug) => {
	if (channels[slug]) {
		return new Promise((resolve, reject) => {
			resolve(channels[slug]);
		});
	}

	return fetch_json(host + "/channels/" + slug + "?per=100", options).then(
		(res) => {
			channels[res.slug] = res;
			return res;
		},
	);
};

export const get_channel_contents = (slug) => {
	if (channels[slug]) {
		return new Promise((resolve, reject) => {
			resolve(channels[slug]);
		});
	}

	return fetch_json(host + "/channels/" + slug + "/contents?per=100&sort=position_desc", options).then(
		(res) => {
			channels[res.slug] = res;
			return res;
		},
	);
};
