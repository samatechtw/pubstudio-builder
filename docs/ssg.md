# Static Site Generation (SSG)

Published sites are prerendered to full HTML at publish time and served directly. A shared
hydration runtime restores interactivity. If a static page is missing or stale, the server
falls back to the SPA shell, so SSG is an optimization, never a correctness dependency.

## Flow

```
publish / live-save (site-api)
  └─ spawn_regenerate_static_pages        (async, 2s debounce on live saves)
       └─ POST $SSG_URL/api/generate      (apps/ssg, Node)
            └─ generateSite(): one HTML document per public page + sitemap.xml + robots.txt
       └─ rows replaced in the per-site SQLite `static_pages` table

request, custom domain (site-api)
  └─ serve_static_page(): fresh row → serve it, else SPA shell

request, *.pubstud.io (platform-api)
  └─ GET {site_server}/api/sites/{id}/static_pages?path=… → substitute ___SITE_API_URL___
     → serve, else SPA shell
```

Verified custom domains route to site-api; everything else goes through platform-api.

## Where things live

| Area                     | File                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| Generator service + CLI  | `apps/ssg/`                                                             |
| Shared root component    | `libs/frontend/feature-render/src/lib/static-site-app.ts`               |
| Static render mode       | `libs/frontend/util-render` (`RenderMode.Static`, `setCssValidation`)   |
| Hydration entry          | `apps/web-site/src/main-hydrate.ts` (`nx build-hydrate web-site`)       |
| Generation trigger       | `backend/site-api/src/app/ssg/generate_static.rs`                       |
| Row lookup + accounting  | `backend/site-api/src/app/ssg/static_serve.rs`                          |
| platform-api serve path  | `pubstudio/backend/platform-api/src/app/serve/serve_web_site.rs`        |
| `static_pages` migration | `backend/site-api/db/sites/migrations/20260707090000_static_pages.sql`  |

## Generator

`POST /api/generate`, `GET /healthz`, listens on `PORT` (default 3200; `SSG_PORT` collides
with Kubernetes service-link vars). The same code is a CLI:

```sh
esno apps/ssg/src/cli.ts --site site.json --out dist [--base-url …] [--runtime …] [--no-js [--force]]
```

Per site: one row per public page, plus `/`, `/robots.txt`, and `/sitemap.xml` (only when a
base URL is known; site-api uses the first configured domain). With a base URL each page gets
canonical, `og:url` and `twitter:url` tags. Site-defined head tags win. Unpublished and
disabled sites get no rows.

`--no-js` drops the payload and runtime. `detectNoJsBlockers` lists what would break
(events, forms, custom Vue components) and generation refuses unless `--force`d.

Input columns are JSON-encoded strings and the API adds a layer, so `parseJsonField`
unwraps up to 3 levels. The page payload is single-encoded `IStoredSite`.

## Hydration

One bundle from `main-hydrate.ts`, baked into both API images, served at
`/_ps/site.js?v=<version>` with immutable caching. Pages inline the site as
`window.__PUBSTUDIO_SITE__`; the runtime calls `unstoreSite` and `createSSRApp(App).mount('#app')`.
Navigation is plain `<a href>` (MPA). `replaceHead` runs only on client-side navigation.

## Markup parity

There is one renderer. The generator runs the existing `h()` tree under
`@vue/server-renderer`; both sides render `createStaticSiteApp` in `static` mode, so markup
matches by construction. `RenderMode.Static` means:

- plain `<a href>` instead of `RouterLink`
- event registration in `onMounted`, never in `setup`
- `CSS.supports` validation off on both sides (`CSS` does not exist in Node)
- site styles and font links stay inside `#app`; only base app CSS goes in `<head>`

## Storage, freshness, accounting

Rows live in the per-site SQLite DB and are served by Rust, not S3. This keeps serving
single-hop, transactional with publish, and reuses domain resolution, publish/disabled
checks, usage limits, and URL substitution. A static read is about 1 ms.

- Each row stores the published `content_updated_at`. Mismatch → SPA shell, and the next
  save/publish regenerates. A failed generation clears rows rather than leaving stale ones.
- `serve_static_page` applies the same disabled, bandwidth, and view checks as
  `get_current_site`, on both servers. The runtime also POSTs `page_view`.
- Unknown routes serve `/not-found` with a 404; sites without one get the SPA shell (200).
- On platform-api, `___SITE_API_URL___` is replaced with `{site_server}/api/sites/current`,
  so runtime calls go cross-origin. `get_current_site` and `record_page_view` fall back to
  `Origin` when `Host` is the server address.
- Regeneration triggers: publish, live-save with no draft, domain change, `disabled` change.

## Configuration

| Variable              | Where    | Notes                                                    |
| --------------------- | -------- | -------------------------------------------------------- |
| `SSG_URL`             | site-api | Unset → generation skipped (logged), sites client-render |
| `PORT`                | ssg      | Default 3200                                             |
| `SQLITE_JOURNAL_MODE` | site-api | Default `wal`; `truncate` on stg/prod                    |

stg/prod manifests: `pubstudio-infra/k8s/{stg,prod}/ssg.k8s-*.yaml`. Dev: `tools/k8s/dev/ssg/`.

stg/prod site DBs sit on a virtiofs mount, where WAL's shared-memory index is unsupported.
A host-side `sqlite3` open resets the WAL under the pod and causes `disk I/O error`. Hence
`truncate` there, and the rule: never open a live site DB with host `sqlite3`, copy it first.

## Dev / testing

- `nx test ssg` for generation; site-api endpoints in `apps/api-site-test`.
- Dev Free-tier bandwidth is 7.5 KB, so one static view exhausts it and later requests 509.
  PATCH the site to a paid type, then `GET /api/actions/persist-usage` and `/api/actions/reset-cache`.
- Site-api pod restarts wipe dev site DBs; reseeded sites are unpublished with no rows.
- Publish through platform-api (as the builder does) when testing the platform serve path;
  publishing via site-api directly does not sync the platform `published` flag.
- A statically served page has `<meta name="generator" content="pubstudio-ssg/…">`, a
  populated `#app`, and no `/api/sites/current` request. An unreplaced "Pub Studio" title is
  the seed-shell fallback: check bandwidth and publish state.

## Known limitations

- No HTTP caching headers on static responses; a 304 would need a bandwidth/view policy.
- A subtree that fails to render is a warning in the site-api log, not a failed page.
- Sites published before SSG stay on the SPA path until published again.
- Only the default language is prerendered.
- No `router-link-active` classes.
- Uploads stay as absolute S3 URLs, so CLI exports are not self-contained.
- No e2e coverage of publish → static serve → hydration.
