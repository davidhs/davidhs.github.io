import fs from "node:fs";
import path from "node:path";

type PageLink = {
	url: string;
	name: string;
};

/** Absolute path to the thoughts directory containing markdown files. */
const THOUGHTS_DIR = path.resolve("thoughts");
/** Absolute path to the page file that contains the page_links array. */
const PAGE_FILE = path.resolve("src/pages/thoughts.solid.js");

/**
 * Recursively collect all markdown file paths under the given directory.
 */
function walkMarkdownFiles(dir: string): string[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkMarkdownFiles(fullPath));
			continue;
		}
		if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
			if (entry.name.startsWith("_")) {
				continue;
			}
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Return the first H1 heading (single #) in a markdown file, ignoring code fences.
 */
function findFirstH1(filePath: string): string | null {
	const content = fs.readFileSync(filePath, "utf8");
	const lines = content.split(/\r?\n/);
	let inFence = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.startsWith("```")) {
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			continue;
		}
		const match = line.match(/^\s*#\s+(.+?)\s*$/);
		if (match) {
			return match[1];
		}
	}

	return null;
}

/**
 * Build a display name from filename/date and the first H1 header.
 */
function deriveName(filePath: string): string {
	const base = path.basename(filePath, ".md");
	const dateMatch = base.match(/^(\d{4}-\d{2}-\d{2})\b/);
	const date = dateMatch ? dateMatch[1] : null;

	const h1 = findFirstH1(filePath);
	if (h1) {
		// Prefer the first H1 as the display name; add the date prefix if present.
		if (!date) {
			return h1;
		}
		return `(${date}) ${h1}`;
	}

	// No header found; fall back to filename-based naming.
	if (!date) {
		return base;
	}

	let rest = base.replace(date, "");
	// Trim separators around the date to avoid awkward names like "(date) - title".
	rest = rest.replace(/^[-_ ]+/, "").replace(/[-_ ]+$/, "");
	if (!rest) {
		return `(${date})`;
	}
	return `(${date}) ${rest}`;
}

/**
 * Build the list of page links from markdown files under thoughts/.
 */
function buildPageLinks(): PageLink[] {
	const files = walkMarkdownFiles(THOUGHTS_DIR);
	const links = files.map((filePath) => {
		const rel = path.relative(THOUGHTS_DIR, filePath).split(path.sep).join("/");
		return {
			url: `./thoughts/${rel}`,
			name: deriveName(filePath),
		};
	});

	links.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
	return links;
}

/**
 * Render the page_links array block as a string to be injected into the page file.
 */
function renderPageLinks(links: PageLink[]): string {
	const entries = links
		.map((link) => {
			const url = JSON.stringify(link.url);
			const name = JSON.stringify(link.name);
			return `\t{\n\t\turl: ${url},\n\t\tname: ${name},\n\t},`;
		})
		.join("\n");

	return `const page_links = [\n${entries}\n];`;
}

/**
 * Replace the page_links block in the target page file with the rendered entries.
 */
function updatePageFile(links: PageLink[]): void {
	const content = fs.readFileSync(PAGE_FILE, "utf8");
	const replacement = renderPageLinks(links);
	const blockRegex = /const page_links = \[[\s\S]*?\];/;
	if (!blockRegex.test(content)) {
		throw new Error("Failed to locate page_links block in thoughts.solid.js");
	}
	const updated = content.replace(blockRegex, replacement);

	fs.writeFileSync(PAGE_FILE, updated, "utf8");
}

/**
 * Entry point for the script.
 */
function main(): void {
	const links = buildPageLinks();
	updatePageFile(links);
}

main();
