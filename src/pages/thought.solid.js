import { createSignal, onMount, Show } from "../../js/3rd/solid/solid.js";
import html from "../../js/3rd/solid/html.js";
import { PageFooter } from "../components/page-footer.solid.js";
import { PageHeader } from "../components/page-header.solid.js";
import { PageBody } from "../components/page-body.solid.js";
import { PageContent } from "../components/page-content.solid.js";
import MarkdownIt from "../../js/3rd/markdown-it/markdown-it.js";



function getMdPathFromUrl() {
	const params = new URLSearchParams(location.search);
	const mdlink_param = params.get("mdlink");
	const link = decodeURIComponent(mdlink_param);

	return link;
}

/**
 * @param {string} path
 * @returns
 */
async function loadMarkdownText(path) {
	const res = await fetch(path, { credentials: "same-origin" });
	if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
	return await res.text();
}

export default function PagePrograms() {
	const [htmlOut, setHtmlOut] = createSignal("");
	const [error, setError] = createSignal("");
	const [loading, setLoading] = createSignal(true);

	onMount(async () => {
		try {
			const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
			//purify = DOMPurify;

			const rawPath = getMdPathFromUrl();
            
            /*
			const path = sanitizePath(rawPath);
			if (!path) {
				throw new Error(rawPath ? `Blocked path "${rawPath}". Expected something like /markdown/page1.md` : `Missing ?md=markdown/page1.md in the URL`);
			}
            */

			//const txt = await loadMarkdownText(path);
            const txt = await loadMarkdownText(rawPath);
			const unsafe = md.render(txt);
			//const safe = purify.sanitize(unsafe, { USE_PROFILES: { html: true } });
			//setHtmlOut(safe);

            setHtmlOut(unsafe);
		} catch (e) {
			setError(String(e && e.message ? e.message : e));
		} finally {
			setLoading(false);
		}
	});

	return html`
		<${PageBody}>
			<${PageHeader}/>
			<${PageContent}>


                ${Show({
					when: () => !loading(),
					fallback: html`<div>Loading...</div>`,
					children: () => {
						return error() ? html`<pre>${error()}</pre>` : html`<article innerHTML=${htmlOut()}></article>`;
					}
				})}

			<//>
			<${PageFooter}/>
		<//>
	`;
}
