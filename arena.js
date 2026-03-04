let host = "https://api.are.na/v2/";
let options = { headers: { cache: "no-store" } };

let channels = {};

export const fetch_json = (link, options) =>
	fetch(link, options).then((r) => r.json());
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
