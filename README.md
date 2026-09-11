# unfoldingwithpeg — personal site

The personal site of **Peggy Pei-Chun Hsieh** — learning experience designer &
consultant, Taiwan. A bilingual (English / 繁體中文) static site: hand-written
HTML, no build step, styled with one `styles.css`.

> This is the `site` branch of the `unfoldingwithpeg` repo. The **design system**
> whose tokens and components this site borrows lives on the `main` branch of the
> same repo.

## Stack

- Plain HTML + CSS. No framework, no build step, no JavaScript.
- One stylesheet: `styles.css` — design-system `--uwp-*` tokens and `.uwp-*`
  component classes, plus bespoke page layout (`.site-*`, `.hero`, `.strip`,
  `.cluster`, …).
- Fonts (Google Fonts): **Comic Neue / 粉圓體** for body & UI, **Noto Sans /
  思源黑體** for headings and the "Unfoldingwithpeg" logotype.
- Mobile-first, single breakpoint at `768px`. Light/dark follows the OS setting.

## Structure

```
index.html                      Home (EN)
about/  contact/                About · Contact
zh/…                            Traditional-Chinese (Taiwan) mirror of every page
styles.css                      The one stylesheet (shared by both languages)
assets/brand/                   Logo mark, wordmark, lockup, favicon (SVG)
```

Every English page has a `/zh/` counterpart with the same structure and CSS. The
header/footer language switch (`中文` ⇄ `EN`) links each page to its counterpart,
and every page declares `hreflang` alternates for `en`, `zh-Hant-TW`, and
`x-default`.

## Serving

Links and asset paths are **root-relative** (`/styles.css`, `/zh/`),
so serve from a domain root or a local static server — opening files directly
with `file://` won't resolve the paths.

```bash
python -m http.server 8000    # then visit http://localhost:8000/
```

## Navigation

Primary nav — About · Contact (關於／聯絡) — is
identical in the `<header>` of every page (current page marked with
`aria-current="page"`); the `<footer>` repeats it plus email, LinkedIn, and the
language switch. There's no include mechanism, so header/footer are inlined in
each file — edit them across all pages together.

## To do before going live

- **Contact form** falls back to a `mailto:` link (no backend). Swap the form
  `action` for a static form handler (Formspree, Netlify Forms) when deploying.
- The `About` page uses a temporary **"PH" monogram** in place of a headshot —
  drop a square photo into `assets/brand/` and wire it in.
