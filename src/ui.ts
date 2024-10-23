import { Hono } from 'hono';
import { html, raw } from 'hono/html';
import { ApiListWikisResponse, RequestVars } from './types';
import { HTTPException } from 'hono/http-exception';
import { CfEnv, routeCreateWiki, routeDeleteWiki, routeListWikis } from './durable-objects';
import { apiKeyAuth } from './shared';

export const uiAdmin = new Hono<{ Bindings: CfEnv; Variables: RequestVars }>();
export const uiAbout = new Hono<{ Bindings: CfEnv; Variables: RequestVars }>();

function RediflareName() {
	return html`<span class="rediflare-name">Tiddlyflare <span style="color: var(--pico-primary)">✎</span></span>`;
}

uiAbout.get('/', async (c) => {
	return c.html(
		Layout({
			title: 'Tiddlyflare - Your own TiddlyWiki hosting platform.',
			description: 'A TiddlyWiki hosting platform deployed in your own Cloudflare account.',
			image: '',
			children: AboutIndex(),
		})
	);
});

function AboutIndex() {
	const heroSnippetCode = `TiddlyWiki ::

a non-linear personal web notebook
for capturing, organising and sharing
complex information`;

	return html`
	<header class="about-header container">
		<nav>
			<ul>
				<li>
					<p style="margin-bottom: 0"><a href="/" class="contrast">${RediflareName()}</span></p>
				</li>
			</ul>
			<ul>
				<li>
					<a href="https://github.com/lambrospetrou/tiddlyflare" target="_blank"><button class="contrast">Github repo</button></a>
				</li>
			</ul>
		</nav>
	</header>

	<main class="container">
		<section class="about-hero">
			<div>
				<h2 class="text-center"><kbd>Hosting platform</kbd> for your <mark>TiddlyWikis.</mark></h2>
				<p class="text-center"><em>Deploy Tiddlyflare in your own Cloudflare account.</em></p>
			</div>

			<div class="mac-window">
				<div class="mac-window-header">
					<div class="mac-window-buttons">
						<div class="mac-window-button mac-window-close"></div>
						<div class="mac-window-button mac-window-minimize"></div>
						<div class="mac-window-button mac-window-maximize"></div>
					</div>
				</div>
				<div class="mac-window-content overflow-auto">
					<pre class="hero-snippet"><code>${heroSnippetCode}</code></pre>
				</div>
			</div>
		</section>

		<section class="text-center">
			<p><code><span class="self-window-location-domain">tiddly-staging.lambros.dev</span></code> uses the ${RediflareName()} hosting platform for <a href="https://tiddlywiki.com" target="_blank">TiddlyWiki</a>.</p>
			<p><a href="https://github.com/lambrospetrou/tiddlyflare/fork"><button>Fork the repository ➜ <code>npm run deploy:prod</code></button></a></p>

			<script>
			(function() {
				document.querySelectorAll(".self-window-location-domain").forEach(n => n.innerHTML = window.location.host ?? "tiddly.lambros.dev");
			})()
			</script>
		</section>

		<section style="margin-top: 3rem; max-width: 640px; margin-left: auto; margin-right: auto;">
			<h4 class="text-center">Learn and understand TiddlyWiki</h4>
			<ul style="text-align:left; font-size: 0.875rem;">
				<li>Watch <a href="https://www.youtube.com/watch?v=vsdDs7oOLlg&ab_channel=SorenBjornstad" target="_blank">Experience TiddlyWiki Fluency: Creating a Reading List</a></li>
				<li>Read <a href="https://groktiddlywiki.com/read/" target="_blank">Grok TiddlyWiki - Build a deep, lasting understanding of TiddlyWiki</a></li>
				<li>Visit the <a href="https://tiddlywiki.com" target="_blank">TiddlyWiki homepage</a></li>
			</ul>
		</section>
	</main>

	<hr>
	<footer class="container text-center">
		<p>${RediflareName()} is built by <a href="https://www.lambrospetrou.com" target="_blank">Lambros Petrou</a>. 🚀</p>
		<p><small><a href="/admin/ui/" class="secondary">Open Admin UI</a></small></p>
	</footer>

	<style>
		:root {
			--app-window-code-bg-color: #f0f0f0;
		}

		h1, h2, h3, h4, h5, p {
			text-wrap: pretty;
		}

		.text-center { text-align: center; }

		.about-header .rediflare-name {
			font-size: 2rem;
		}

		.about-hero {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin: 2rem auto 4rem auto;
		}

		.about-hero h2 {
			line-height: 2.25rem;
		}

		pre.hero-snippet {
			--pico-code-background-color: var(--app-window-code-bg-color);
			margin-bottom: 0;
		}
		pre.hero-snippet code {
			padding: 0;
		}

		.mac-window {
			width: fit-content;
			max-width: 95%;
			background-color: var(--app-window-code-bg-color);
			border-radius: 8px;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			overflow: hidden;
		}

		.mac-window-header {
			background-color: #e0e0e0;
			padding: 10px;
			display: flex;
			align-items: center;
		}

		.mac-window-buttons {
			display: flex;
			gap: 6px;
		}

		.mac-window-button {
			width: 12px;
			height: 12px;
			border-radius: 50%;
		}

		.mac-window-close { background-color: #ff5f56; }
		.mac-window-minimize { background-color: #ffbd2e; }
		.mac-window-maximize { background-color: #27c93f; }

		.mac-window-content {
			padding: 1rem;
		}

		@media (min-width: 50rem) {
			.mac-window-content {
				padding: 2rem;
			}
		}
	</style>
`;
}

uiAdmin.use('/-_-/ui/partials.*', async (c, next) => {
	const tenantId = apiKeyAuth(c.env, c.req.raw);
	c.set('tenantId', tenantId);
	return next();
});

uiAdmin.get('/admin/ui', async (c) => {
	const main = Dashboard({});
	return c.html(
		Layout({
			title: 'Tiddlyflare - Your own TiddlyWiki hosting platform.',
			description: 'A TiddlyWiki hosting platform deployed in your own Cloudflare account.',
			image: '',
			children: main,
		})
	);
});

uiAdmin.get('/-_-/ui/partials.ListWikis', async (c) => {
	const { data } = await routeListWikis(c.env, c.var.tenantId);
	const wikisEl = WikiList({
		data,
		swapOOB: false,
	});
	return c.html(html`${wikisEl}`);
});

uiAdmin.post('/-_-/ui/partials.CreateWiki', async (c) => {
	const form = await c.req.raw.formData();
	const name = ((form.get('name') as string) ?? '').trim();
	if (!name) {
		throw new HTTPException(400, {
			res: new Response(`<p>Invalid wiki name!</p>`, { status: 400 }),
		});
	}
	const wikiType = (form.get('wikiType') as string) ?? '';
	if (!wikiType) {
		throw new HTTPException(400, {
			res: new Response(`<p>Invalid wiki type!</p>`, { status: 400 }),
		});
	}

	const _ = await routeCreateWiki(
		c.env,
		c.var.tenantId,
		name,
		wikiType
	);
	const {data} = await routeListWikis(c.env, c.var.tenantId);
	const rulesEl = WikiList({
		data,
		swapOOB: true,
	});
	const createRuleForm = CreateRuleForm();

	return c.html(html`${createRuleForm} ${rulesEl}`);
});

uiAdmin.post('/-_-/ui/partials.DeleteWiki', async (c) => {
	const form = await c.req.raw.formData();
	const wikiId = decodeURIComponent((form.get('wikiId') as string) ?? '').trim();
	if (!wikiId) {
		throw new HTTPException(400, {
			res: new Response(`<p>Invalid request for deletion!</p>`, { status: 400 }),
		});
	}
	const { data } = await routeDeleteWiki(
		c.env,
		c.var.tenantId,
		wikiId,
	);
	const rulesEl = WikiList({
		data,
		swapOOB: false,
	});
	return c.html(html`${rulesEl}`);
});

function WikiList(props: { data: ApiListWikisResponse['data']; swapOOB: boolean }) {
	const { data, swapOOB } = props;

	return html`
		<section id="wikis-list" hx-swap-oob="${swapOOB ? 'true' : undefined}">
			<h3>Existing wikis</h3>
			${
				data.wikis.length === 0 ? html`<p>You have no wikis yet (•_•)</p>` : null
			}
			${
				// TODO Improve :)
				data.wikis.map(
					(wiki) => html`
						<article>
							<header>
								<a href="${wiki.wikiUrl}" target="_blank">${wiki.name ?? wiki.wikiId} ↝</a>
								<span>
								${
									wiki.createdAtMs
									? html`<small>(<em>${new Date(wiki.createdAtMs).toISOString()}</em>)</small>`
									: null
								}
								</span>
							</header>
							<section>
								<div><small><strong>ID</strong> <code class="text-wrap">${wiki.wikiId}</code></small></div>
							</section>
							<footer>
								<button
									class="outline"
									hx-post="/-_-/ui/partials.DeleteWiki"
									hx-vals=${raw(`'{"wikiId": "${encodeURIComponent(wiki.wikiId)}","tenantId": "${encodeURIComponent(wiki.tenantId)}"}'`)}
									hx-target="#wikis-container"
									hx-confirm="Are you sure you want to delete wiki?"
								>
									Delete wiki
								</button>
							</footer>
						</article>
						<hr />
					`
				)
			}
		</section>
	`;
}

function CreateRuleForm() {
	return html`
		<form id="create-container" action="#" hx-post="/-_-/ui/partials.CreateWiki" hx-target="#create-container" hx-swap="outerHTML">
			<hgroup>
				<h3>Create new TiddlyWiki</h3>
				<!-- <p>Enter a display name for your wiki to identify it in the dashboard.</p> -->
			</hgroup>
			<input id="new-wiki--name" name="name" required type="text" minlength="1" maxlength="100" placeholder="Display name" aria-label="Display name" aria-describedby="name-helper" />
			<small id="name-helper">The display name is used to identify your wikis in the dashboard.</small> 
			<input id="new-wiki--type" name="wikiType" type="text" value="tw5" required hidden />
			<button type="submit">
				Create TiddlyWiki
			</button>
		</form>
	`;
}

function Dashboard(props: {}) {
	const createRuleForm = CreateRuleForm();
	return html`
		<header class="container">
			<nav>
				<ul>
					<li>
						<h1 style="margin-bottom: 0"><a href="https://tiddly.lambros.dev" class="contrast">${RediflareName()}</a></h1>
					</li>
				</ul>
				<ul>
					<li>
						<a href="https://github.com/lambrospetrou/tiddlyflare" target="_blank"><button class="contrast">Github repo</button></a>
					</li>
				</ul>
			</nav>
		</header>

		<main class="container">
			<section>
				<hgroup>
					<h2>Tiddlyflare-Api-Key</h2>
					<p>Paste your API key to enable the page to fetch your data.</p>
				</hgroup>
				<!-- This input value is auto-injected by HTMX in the AJAX requests to the API. See helpers.js. -->
				<input
					type="text"
					id="t-api-key"
					name="t-api-key"
					style="-webkit-text-security:disc"
					hx-trigger="input"
					hx-target="#wikis-container"
					hx-get="/-_-/ui/partials.ListWikis"
					hx-params="none"
				/>
			</section>

			<section>
				<h2>TiddlyWikis</h2>

				${createRuleForm}
				<hr />
				<div id="wikis-container" hx-get="/-_-/ui/partials.ListWikis" hx-trigger="load">
					<p>
						Paste your <code>Tiddlyflare-Api-Key</code> in the input box at the top, or append it in the URL hash (e.g.
						<code>#tApiKey=t_key_TENANT1111_sometoken</code>) to interact with your TiddlyWikis.
					</p>
				</div>
			</section>

			<script type="text/javascript">
				(function () {
					// Auto load the api key if it's in the hash section of the URL.
					function parseApiKeyFromHash() {
						let hashFragment = window.location.hash?.trim();
						if (hashFragment) {
							hashFragment = hashFragment.startsWith('#') ? hashFragment.substring(1) : hashFragment;
							const params = new URLSearchParams(hashFragment);
							const apiKey = params.get('tApiKey')?.trim();
							if (apiKey) {
								document.querySelector('#t-api-key').value = apiKey;
							}
						}
					}
					parseApiKeyFromHash();
				})();
			</script>
		</main>
		<footer class="container">
			${RediflareName()} is built by <a href="https://www.lambrospetrou.com" target="_blank">Lambros Petrou</a>. 🚀
		</footer>
	`;
}

function Layout(props: { title: string; description: string; image: string; children?: any }) {
	const image = props.image || 'https://tiddly.lambros.dev/ui/static/20241021T0955-iCUuAnWTud.png';
	return html`
		<html>
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="color-scheme" content="light dark" />
				<title>${props.title}</title>
				<meta name="description" content="${props.description}" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="${props.title}" />
				<meta property="og:image" content="${image}" />

				<link
					rel="icon"
					href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22%23990000%22>✏️</text></svg>"
				/>

				<meta name="htmx-config" content='{"withCredentials":true,"globalViewTransitions": true,"selfRequestsOnly": false}' />

				<link rel="stylesheet" href="/ui/static/pico.v2.0.6.red.min.css" />
				<style>
					:root {
						--pico-form-element-spacing-vertical: 0.75rem;
						--pico-form-element-spacing-horizontal: 1.125rem;
					}

					button {
						--pico-font-weight: bold;
						font-size: 0.875em;
					}

					.rediflare-name {
						font-weight: bold;
					}

					.text-wrap {
						word-wrap: break-word;
  						word-break: break-all;
						white-space: pre-wrap;
					}
				</style>
			</head>
			<body>
				${props.children}

				<script src="/ui/static/htmx.2.0.2.min.js" defer></script>
				<script src="/ui/static/generated/app.js" defer></script>
			</body>
		</html>
	`;
}
