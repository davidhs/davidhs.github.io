import { For } from "../../js/3rd/solid/solid.js";
import html from "../../js/3rd/solid/html.js";
import { PageFooter } from "../components/page-footer.solid.js";
import { PageHeader } from "../components/page-header.solid.js";
import { PageBody } from "../components/page-body.solid.js";
import { PageContent } from "../components/page-content.solid.js";

const page_links = [
	{
		url: "./jbcc.html",
		name: "Joscha Bach Content Compilation",
	},
];

export default function PageMisc() {
	return html`
		<${PageBody}>
			<${PageHeader} select="Misc"/>
			<${PageContent}>
				<p>Miscellaneous pages that do not fit under the other headings.</p>

				<ul class="list-group dark">
					<${For} each=${page_links}>${
						(link) => html`<li><a href=${link.url}>${link.name}</a></li>`
					}<//>
				</ul>
			<//>
			<${PageFooter}/>
		<//>
	`;
}
