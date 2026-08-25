import fs from "fs";
import { get_channel_contents } from "./arena.js";

const DATA_FILE = "./data.json";

function loadData() {
	if (!fs.existsSync(DATA_FILE)) {
		console.error("data.json not found. Run gallery_downloader.js first.");
		process.exit(1);
	}
	return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveData(data) {
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function fetchChannel(slug) {
	let data = loadData();
	let index = data.findIndex((ch) => ch.slug === slug);

	if (index === -1) {
		console.error(`Channel "${slug}" not found in data.json.`);
		process.exit(1);
	}

	let channel = data[index];
	console.log(`Fetching contents for: ${channel.title} (${slug})`);

	let res = await get_channel_contents(channel.id);

	if (!res.data) {
		console.error("No data returned from API:", res);
		process.exit(1);
	}

	data[index] = { ...channel, contents: res.data };
	saveData(data);
	console.log(`\nUpdated data.json — ${res.data.length} items fetched for "${slug}".`);
	process.exit(0);
}

function interactiveSelect() {
	let data = loadData();
	let channels = data.map((ch) => ({ slug: ch.slug, title: ch.title }));

	let filter = "";
	let cursor = 0;
	let scrollOffset = 0;

	function getFiltered() {
		if (!filter) return channels;
		let q = filter.toLowerCase();
		return channels.filter(
			(ch) => ch.slug.toLowerCase().includes(q) || ch.title.toLowerCase().includes(q)
		);
	}

	function getTermHeight() {
		return process.stdout.rows || 24;
	}

	function render() {
		let filtered = getFiltered();
		let termH = getTermHeight();
		// reserve lines: 3 header + 1 footer = 4, rest for list
		let listHeight = termH - 5;
		if (listHeight < 3) listHeight = 3;

		// keep cursor in view
		if (cursor < scrollOffset) scrollOffset = cursor;
		if (cursor >= scrollOffset + listHeight) scrollOffset = cursor - listHeight + 1;

		// reset cursor if filtered list shrunk
		if (cursor >= filtered.length) cursor = Math.max(0, filtered.length - 1);

		let out = [];
		// move to top, clear screen
		out.push("\x1b[H\x1b[2J");

		out.push(`  \x1b[1mSelect a channel to fetch\x1b[0m  (${channels.length} total)`);
		out.push(`  Type to filter · ↑↓ navigate · Enter to select · q to quit`);
		out.push(`  \x1b[2mFilter:\x1b[0m \x1b[36m${filter || "(none)"}\x1b[0m`);
		out.push(`  \x1b[2m${"─".repeat(50)}\x1b[0m`);

		if (filtered.length === 0) {
			out.push(`  \x1b[2mNo matches for "${filter}"\x1b[0m`);
		} else {
			let visible = filtered.slice(scrollOffset, scrollOffset + listHeight);
			let startIdx = scrollOffset;

			for (let i = 0; i < visible.length; i++) {
				let ch = visible[i];
				let globalIdx = startIdx + i;
				let isSelected = globalIdx === cursor;
				let num = String(globalIdx + 1).padStart(3);

				let line = `  ${num}  ${ch.slug}  \x1b[2m—\x1b[0m  ${ch.title}`;

				if (isSelected) {
					// highlight: inverse video + bold
					out.push(`  \x1b[7m\x1b[1m${line}\x1b[0m`);
				} else {
					out.push(line);
				}
			}

			// scroll indicators
			if (scrollOffset > 0) {
				out.push(`  \x1b[2m↑ ${scrollOffset} more above\x1b[0m`);
			}
			let below = filtered.length - scrollOffset - listHeight;
			if (below > 0) {
				out.push(`  \x1b[2m↓ ${below} more below\x1b[0m`);
			}
		}

		out.push(`  \x1b[2m${"─".repeat(50)}\x1b[0m`);

		process.stdout.write(out.join("\n") + "\n");
	}

	// hide cursor, enable raw mode
	process.stdout.write("\x1b[?25l");
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding("utf-8");

	render();

	process.stdin.on("data", (key) => {
		let filtered = getFiltered();

		// ctrl+c or q
		if (key === "\x03" || key === "q" || key === "Q") {
			process.stdout.write("\x1b[?25h"); // show cursor
			process.stdin.setRawMode(false);
			process.stdin.pause();
			console.log("\x1b[2J\x1b[H");
			process.exit(0);
		}

		// Enter
		if (key === "\r" || key === "\n") {
			if (filtered.length > 0) {
				let selected = filtered[cursor];
				process.stdout.write("\x1b[?25h");
				process.stdin.setRawMode(false);
				process.stdin.pause();
				console.log("\x1b[2J\x1b[H");
				console.log(`Selected: ${selected.slug} (${selected.title})\n`);
				fetchChannel(selected.slug);
			}
			return;
		}

		// Arrow up
		if (key === "\x1b[A") {
			if (cursor > 0) cursor--;
			render();
			return;
		}

		// Arrow down
		if (key === "\x1b[B") {
			if (cursor < filtered.length - 1) cursor++;
			render();
			return;
		}

		// Backspace
		if (key === "\x7f" || key === "\x08" || key === "\x1b[3~") {
			filter = filter.slice(0, -1);
			cursor = 0;
			scrollOffset = 0;
			render();
			return;
		}

		// Escape sequences we don't handle — ignore
		if (key.startsWith("\x1b")) return;

		// Regular character — add to filter
		filter += key;
		cursor = 0;
		scrollOffset = 0;
		render();
	});
}

// Main
let slug = process.argv[2];

if (slug) {
	fetchChannel(slug);
} else {
	interactiveSelect();
}
