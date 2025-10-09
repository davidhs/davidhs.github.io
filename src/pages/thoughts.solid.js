import { For } from "../../js/3rd/solid/solid.js";
import html from "../../js/3rd/solid/html.js";
import { PageFooter } from "../components/page-footer.solid.js";
import { PageHeader } from "../components/page-header.solid.js";
import { PageBody } from "../components/page-body.solid.js";
import { PageContent } from "../components/page-content.solid.js";

const page_links = [
	{
		url: "./thoughts/2025-10-08 - Mind's eye exercise - Meditation with eyes open.md",
		name: "(2025-10-08) Mind's eye exercise: Meditation with eyes open to notice random mind's eye images appearing",
	},
];

page_links.sort((a, b) => {
	return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
});

export default function PagePrograms() {
	return html`
		<${PageBody}>
			<${PageHeader} select="Thoughts"/>
			<${PageContent}>
				<p>Thoughts:</p>

				<ul class="list-group dark">
					<${For} each=${page_links}>${(link) => {
						const mdlink = encodeURIComponent(link.url);

						return html`<li><a href=${"./thought.html?mdlink=" + mdlink}>${link.name}</a></li>`;
					}
					}<//>
				</ul>
			<//>
			<${PageFooter}/>
		<//>
	`;
}
