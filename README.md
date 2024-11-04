# Tiddlyflare

Your own self-hosted [TiddlyWiki](https://tiddlywiki.com/) hosting platform.

Built with [Cloudflare Workers](https://developers.cloudflare.com/workers/) and [Durable Objects](https://developers.cloudflare.com/durable-objects/), specifically the [SQLite in DO](https://blog.cloudflare.com/sqlite-in-durable-objects/) variant.

## Development and Deployment

I assume that you already have a Cloudflare account with a Workers Paid plan ($5/month) since for now Durable Objects do not have a free tier (yet!), and you checked out this repository.

1. Install dependencies: `npm ci`.
2. Create a local file `.dev.vars` with the following content:
    ```
    VAR_API_AUTH_ADMIN_KEYS_CSV=",t_key_TENANT1111_sometoken,"
    ```
3. Start the local setup using `npm run dev`. This should start the Workers/Durable Objects listening on <http://127.0.0.1:8787>.
4. Run the tests against that: `npm run test`.
5. Modify the `wrangler.toml` to use your own `route.pattern` for each environment, i.e. replace `tiddly-staging.lambros.dev` and `tiddly.lambros.dev` with your own domains.
6. Deploy with `npm run deploy:staging` or `npm run deploy:prod`.

That's it! 🥳

## Authentication

The API provided by the Worker is protected using the header `Tiddlyflare-Api-Key` that expects a string value of the format `t_key_<TENANT_ID>_<TOKEN>`.

The `TENANTID` should be non-empty and is used as sharding mechanism for the multi-tenancy aspects (i.e. multiple users having their own list of wikis).

The whole API key is checked against a [Secret](https://developers.cloudflare.com/workers/configuration/secrets/) configured for the worker named `VAR_API_AUTH_ADMIN_KEYS_CSV` (as you saw in step 2 above).

In the future, these api keys will move to Workers KV to allow unlimited number of tenants.

To generate an API key according to the format expected run: `npm run --silent gen:apikey`

Example:
```sh
$ npm run --silent gen:apikey
t_key_dP1gH07gDCnWwql9HrwPshZzsQfxCCgh_vm6PT3RH5fK37hS8fl6B5NlRJ8M460dKD4qS
```

Then, once you have the above key run `npx wrangler secret put --env {staging,prod,dev} VAR_API_AUTH_ADMIN_KEYS_CSV` to store it in your worker (you will need to paste it after prompted), or just create it through the Cloudflare dashboard.

### Tenant ID

- Each tenant ID should be considered like an account/organization.
- Each tenant can have multiple API keys (but the tenant ID portion should be the same across them to be considered as the same tenant).
- Each tenant can have unlimited number of custom domains using the same deployment (Cloudflare limits apply, not application logic limits).
- There is one database (SQLite in Durable Objects (DO)) per tenant for coordinating the creation/deletion of wikis. However, each wiki is NOT bottlenecked by the single DO for the tenant. Each wiki lives in its own Durable Object and request to that wiki go straight to that DO from the edge workers.

## Custom domains

Once you have the project deployed, you can add custom domains to it ([see docs](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/#set-up-a-custom-domain-in-your-wranglertoml)).

Just modify the `wrangler.toml` file for the corresponding environment (e.g. `dev`, `staging`, `prod`) you want and add as many custom domains as you want.

```
routes = [
  { pattern = "shop.example.com", custom_domain = true },
  { pattern = "shop-two.example.com", custom_domain = true }
]
```

Fun fact, with Tiddlyflare it's not the domain that decides the "account used" but the `TENANT_ID` part of the API key (see previous section).

So, as long as you use the same API key, accessing the `/admin/ui/` admin UI from any of your custom domains is exactly the same.

## Admin UI

There is an admin UI at `/admin/ui/`, e.g. <http://127.0.0.1:8787/admin/ui/> where you can put the test API KEY `t_key_TENANT1111_sometoken` in the input box and it will start pinging the local workers (started in step 3 above).

I often refresh the page to make sure everything is reset, so for ease of use you can also provide the token in the URL hash segment, e.g. <http://127.0.0.1:8787/admin/ui/#tApiKey=t_key_TENANT1111_sometoken>.

The admin UI allows you to list, delete, and create redirection rules.
Soon, the UI will also show analytics and statistics about the visits of these links, which was one of the motivations doing the project in the first place.

## Architecture

How are Durable Objects used in this project?

Read "Building a global TiddlyWiki hosting platform with Cloudflare Durable Objects and Workers — Tiddlyflare": https://www.lambrospetrou.com/articles/tiddlyflare/

## Contact - Help - Feedback

Feel free to get in touch with me at [@lambrospetrou](https://x.com/LambrosPetrou).
