# unfoldingwithpeg — personal site

The bilingual (**繁體中文** / English) personal site of **Peggy Pei-Chun Hsieh** —
learning experience designer & consultant, Taiwan. Built with **Astro 6**,
server-rendered on **Cloudflare Workers**.

> This is the `site` branch of the `unfoldingwithpeg` repo. The **design system**
> whose tokens and components this site borrows lives on the `main` branch of the
> same repo (kept locally as a gitignored `Design system/` folder).

## Stack

- **Astro 6** with `output: "server"` and the **`@astrojs/cloudflare`** adapter.
- **Cloudflare Workers** for hosting; **Wrangler** for local preview and deploy.
- **Node 22+**, **TypeScript strict** mode.
- One stylesheet, `src/styles/global.css` — the design-system `--uwp-*` tokens and
  `.uwp-*` component classes, plus this site's page layout (`.site-*`, `.hero`,
  `.strip`, …). No CSS framework.
- Fonts (Google Fonts, via `@import` in `global.css`): **Imprima** + **Noto Sans**;
  Chinese pages fall through the same tokens to system CJK / 思源黑體.
- No UI framework (no React/Vue/Svelte) and no CSS framework (no Tailwind).

## Bilingual routing

Configured in [`astro.config.mjs`](astro.config.mjs):

| Locale  | Default? | URL prefix | Example        |
| ------- | -------- | ---------- | -------------- |
| `zh-TW` | ✅ yes   | none       | `/`, `/about/` |
| `en`    | no       | `/en/`     | `/en/`, `/en/about/` |

- `prefixDefaultLocale: false` → **zh-TW lives at the root**, English under `/en/`.
- `fallback: { en: "zh-TW" }` → an English route that doesn't exist yet falls back
  to its zh-TW equivalent.

`BaseLayout.astro` takes a `lang` prop (`"zh-TW"` | `"en"`), sets `<html lang>`,
and emits the `hreflang` alternates. `LangSwitcher.astro` links each page to its
counterpart in the other language; `Nav.astro` renders the locale-aware primary
nav (About · Contact).

## Directory structure

```
src/
  content/posts/          Empty for now — the posts collection + schema arrive later.
  layouts/BaseLayout.astro
  components/
    Nav.astro             Header: brand + primary nav + language switch.
    LangSwitcher.astro    Toggles zh-TW ⇄ en of the current page.
    Footer.astro          Footer nav + email/LinkedIn + language switch.
  pages/
    index.astro           zh-TW home     (/)
    about.astro           zh-TW about    (/about/)
    contact.astro         zh-TW contact  (/contact/)
    en/
      index.astro         English home   (/en/)
      about.astro         English about  (/en/about/)
      contact.astro       English contact(/en/contact/)
  styles/global.css       The one stylesheet (shared by both languages).
public/assets/brand/      Logo mark, wordmark, lockup, favicon (SVG).
```

## Run the dev server

```bash
npm install
npm run dev
```

Astro serves at <http://localhost:4321/>. Visit `/` for the Chinese site and
`/en/` for the English one.

## Deploy to Cloudflare Workers

```bash
npm run deploy
```

This runs `astro build` (emitting the Worker + static assets into `dist/`) and
then `wrangler deploy`. First-time setup:

1. `npx wrangler login` to authenticate with your Cloudflare account.
2. Worker settings live in [`wrangler.jsonc`](wrangler.jsonc) (name, compat date,
   assets binding).

To preview the built Worker locally before deploying:

```bash
npm run build
npm run preview   # wrangler dev, serving the built Worker
```

### Automated deploys (GitHub Actions)

Pushing to `main` deploys the site automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which runs the
same `npm run deploy` in CI. So merging a post PR into `main` publishes it — no
local deploy needed. The workflow can also be run on demand from the repo's
**Actions** tab (**Deploy to Cloudflare → Run workflow**).

It requires two **repository secrets** (Settings → Secrets and variables →
Actions):

| Secret                  | What it is                                        |
| ----------------------- | ------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token from the "Edit Cloudflare Workers" template (My Profile → API Tokens). |
| `CLOUDFLARE_ACCOUNT_ID` | The target account id (Workers & Pages → sidebar). |

Add both **before** the first push to `main`, or the deploy step fails for lack
of credentials. Keep the token private and rotate it in Cloudflare if it leaks.

## D1 binding (future RAG work)

A **Cloudflare D1** database binding is scaffolded — but **commented out** — in
[`wrangler.jsonc`](wrangler.jsonc), under a `TODO`. It will back the planned
retrieval-augmented-generation feature over blog posts. To enable it later:

1. `npx wrangler d1 create unfoldingwithpeg-rag`
2. Paste the returned `database_id` into `wrangler.jsonc` and uncomment the
   `d1_databases` block.
3. Access it in endpoints via `locals.runtime.env.DB`.

## Translation status

Both languages currently carry **complete, hand-written copy** — the English
pages are real content, not placeholders. If a new page is ever added zh-first,
wrap the not-yet-translated English in a `[TRANSLATE: …]` marker so it's easy to
grep for later. There are **no `[TRANSLATE:]` markers in the repo today.**

## To do before going live

- **Contact form** falls back to a `mailto:` link (no backend). Swap the form
  `action` for a static form handler (e.g. a Cloudflare Worker endpoint, Formspree)
  when deploying.
- The **About** page uses a temporary **"PH" monogram** in place of a headshot —
  drop a square photo into `public/assets/brand/` and wire it in.
