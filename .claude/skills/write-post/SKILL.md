---
name: write-post
description: Turn a conversation into a bilingual blog post for this Astro site. Drafts a matching zh-TW and English Markdown pair with correct frontmatter (category, kebab-case tags, shared translationKey) under src/content/posts/. Use when the user says "write a post", "turn this into an article", "publish this", "/write-post", 「寫成文章」, 「把這個寫成文章」, 「寫一篇文章」, or wants to publish what we just discussed.
---

# Write a bilingual post

Turn the current conversation into a publishable post for this site: a **pair**
of Markdown files (Traditional Chinese + English) that share a `translationKey`,
placed under `src/content/posts/<category-folder>/<slug>.<lang>.md`.

**The user edits drafts in Claude's side panel.** Whenever the Artifact tool is
available (claude.ai, the Claude apps), hand over every draft by opening it in
the side-panel editor (see "Side-panel editor" below), in every mode, even when
you also write or send the `.md` files. Sending files or pasting Markdown in
the reply is not a substitute. Your reply is not done until the editor's
artifact card is in it.

## Execution mode — decide this FIRST

This skill runs in two environments. Detect which one you're in before Step 3:

- **Claude Code mode** (terminal, desktop app, IDE, claude.ai/code) — you have
  filesystem tools (Write/Edit) and this repo is present. **Write the files
  directly** to disk and offer to preview/deploy.
- **Manual mode** (plain claude.ai chat, or anywhere without repo file access) —
  you cannot write to the repo. Put both files in the **side-panel editor** (see
  "Side-panel editor" below) so the user can edit them there. Only if the
  Artifact tool is not available, **output each file as a Markdown artifact**
  (two artifacts, one per language) whose very first line is a save-path header:

  ```
  Save as: src/content/posts/<category-folder>/<slug>.zh-tw.md
  ```

  followed by the complete file (frontmatter + body). Tell the user explicitly:
  the `Save as:` line is a **path label for them**, not part of the file. When
  they create the file on GitHub, they type that path into GitHub's filename
  box and paste **only** the frontmatter + body (everything below `Save as:`)
  into the editor. Never let the `Save as:` line become the first line inside
  the committed file — YAML will read it as broken frontmatter and the build
  will fail.

  Skip every filesystem/preview/deploy action in manual mode — there is no dev
  server and no `npm` to run. Always produce **both** language files.

Everything else (metadata confirmation, drafting, frontmatter, and the build
rules) is identical in both modes.

## Steps

1. **Confirm the essentials with the user** (in one short message, propose
   sensible defaults from the conversation — don't over-interrogate):
   - **Angle / title** — what the post is actually arguing or covering.
   - **Category** — one of the seven below.
   - **Slug** — lowercase kebab-case, e.g. `completion-is-a-design-problem`.
     Derive it from the English title if the user doesn't specify.
   - **Tags** — 1–8, lowercase kebab-case.

2. **Draft the article in both languages.** Write the zh-TW (Traditional
   Chinese) version and the English version so they say the same thing — a real
   translation, not two unrelated drafts. Base the content on what was discussed
   in the conversation. Use the user's voice; avoid placeholder text.

   Write a **`tldr`** as the post's summary — this is the summary that actually
   shows on the post page (a short paragraph, ≤ 400 chars, in the post's
   language). Do NOT write a separate hand-crafted `description`; instead
   **derive `description` from the tldr**: a single condensed sentence, ≤ 200
   chars, same language. It's required by the schema and feeds the SEO
   `<meta name="description">` and the listing-card subtitles, but it is NOT
   shown on the post page when a tldr is present (the post page shows the tldr
   instead). So the author only thinks about the tldr; the description is its
   trimmed shadow.

   Follow the **House style** section below in both languages, in the body and
   in `title`, `tldr` and `description`. Run its checklist before emitting.

3. **Emit both files** (see paths and frontmatter below). Default both to
   `draft: false`. If the user specifically wants the post staged without going
   live yet, use `draft: true`.
   - **Claude Code mode:** write the two files to disk with your file tools.
   - **Both modes, required:** whenever the Artifact tool is available, open the
     two files in the side-panel editor (see "Side-panel editor" below) so the
     user can edit them in Claude's side panel. Do this every time you hand over
     the Markdown files, not only when asked. Having file tools does not make a
     claude.ai chat "Claude Code mode" for this step.
   - **Manual mode without the Artifact tool:** output the two files as Markdown
     artifacts, each led by its `Save as:` header line (see Execution mode above).

4. **Tell the user how to preview and publish:**
   - **Claude Code mode:** preview at `/posts/<slug>` (zh-TW) and
     `/en/posts/<slug>` (en) on the dev server. Draft posts (`draft: true`) are
     excluded EVERYWHERE — listings AND their own post page (the post routes are
     prerendered from `getPostsByLang`, which filters out drafts), so a
     `draft: true` post returns **404** at its own URL. There is no draft-preview
     mode. Publishing = building and deploying with `draft: false` via
     `npm run deploy`.
   - **Manual mode:** once the user confirms the text in the editor, publish it
     with the `post-to-unfoldingwithpeg` skill if it is available. Otherwise tell
     the user to save each file at its repo path, commit, and deploy
     (`npm run deploy`, or merge to `main`, which deploys). Remind them a
     `draft: true` post won't appear anywhere until flipped to `false`.

## Side-panel editor

The user edits drafts in a published Artifact page: language tabs (中文 /
English), a Markdown editor beside a live preview, frontmatter checks (required
keys, tldr ≤ 400, description ≤ 200, category, tags, matching
`translationKey`), and Save (Cmd/Ctrl+S), Copy and Download .md buttons. Save
stores both `.md` files inside the artifact.

**Template:** the editor built for the first post, "Ambition Post Editor",
`https://claude.ai/artifact/9bDeJf16taJiW6GtK6YLrF`. Its page is generic: it
reads `post.json` to know which post it holds.

### Open a new post in the editor

1. Read the template's page: Artifact `action: "read"`, that URL, `path:
   "index.html"`. Copy the saved file into your working folder as `index.html`.
2. Change only the `<title>` to a short name for this post plus "Post Editor",
   two to four words in all (e.g. `Feedback Loops Post Editor`).
3. Write `post.json`: `{ "slug": "<slug>", "folder": "<category-folder>" }`.
4. Put the drafts at `posts/<slug>.zh-tw.md` and `posts/<slug>.en.md`.
5. Publish as a **new** artifact. Never publish a new post to the template's
   URL, because that would replace the earlier post's editor. Pass
   `file_path: "index.html"`, `icon: "edit"`,
   `capabilities: {"artifact": {}, "downloads": true}`, and `files` mapping
   `post.json` and both `posts/…md` paths. Use `contentType: "text/markdown"`
   for the `.md` files.
6. Tell the user in one line that the editor is open in the side panel and Save
   keeps their changes.

If the template can't be read, build an equivalent page: load the
`artifact-design` and `artifact-capabilities` skills first, save with the
`artifact` capability's files form (`publish({ "posts/…md": … })`), and keep
the features listed above.

### Every later change

- The user may have edited and saved since your last turn. Before changing a
  post, read both saved files back (Artifact `action: "read"` with `paths` for
  the two `.md` files) and build on that text, never on your earlier draft.
- Apply the change, then republish only the `.md` files to the same artifact
  (same `file_path` this session, or its `url` from another chat).
- If the publish is refused because the user saved a newer version, the refusal
  counts as reading it. Merge your change onto that version and publish again.
- Keep any local or repo copies of the two files in sync with the editor.
- When the user confirms the post is final, the editor's saved files are the
  text to publish.

## House style — punctuation and headings

The author edits every draft to these rules, so write them in from the start.
They apply to both languages, in the body and in `title`, `tldr` and
`description`. They never apply to YAML syntax: keys keep their `key: value`
colon.

### 1. No colons inside sentences or paragraphs

Use a comma instead: `,` in English, `，` in zh-TW. This includes a sentence
that introduces a list (`In my own words,` / `用我自己的話說，`).

| Instead of | Write |
|-|-|
| `Felix offers a useful tell: if you're…` | `Felix offers a useful tell, if you're…` |
| `問自己：這件事做完之後…` | `問自己，這件事做完之後…` |

Keep a colon only in these places:
- The label separator in a bullet or numbered list item (rule 2).
- The real title of someone else's work, quoted or linked exactly as published,
  e.g. `[How to be more ambitious: A tutorial for humans with models](…)`.
- URLs and YAML keys.

### 2. No em dashes

Never use `—` (English) or `——` (zh-TW).
- **In a sentence:** replace it with a comma. `self-efficacy — mastery
  experience — is…` becomes `self-efficacy, mastery experience, is…`;
  `自我效能感——我們不會…` becomes `自我效能感，我們不會…`.
- **In a bullet or numbered list item** that pairs a bold label with its
  explanation: separate them with a colon, `:` in English and `：` in zh-TW.

```markdown
- **Speed**: the same work, done faster.
- **速度（Speed）**：同樣的工作，做得更快。
1. **Mastery experiences**: having succeeded at something similar yourself.
```

### 3. Bold lead-in headings sit on their own line

A paragraph that opens with a bold lead-in (`**Altitude.** The low-altitude
request…`) is written as a small heading instead:
- No trailing period: no `.` in English, no `。` in zh-TW.
- The paragraph text starts on the next line. End the heading line with a
  backslash, which is a Markdown hard line break, so the heading and its text
  stay in one paragraph with a line break between them.

```markdown
**Altitude**\
The low-altitude request is "draft an agenda and slides."…

**縮小步伐，不縮小目標**\
每週挑一件你平常會用慣性完成的任務…
```

The backslash must be the last character on the line, with no trailing space.
Without it, the text joins the heading on one line.

### 4. zh-TW punctuation

Use full-width punctuation in zh-TW prose: `，。「」（）；？`. Keep ASCII
punctuation inside the frontmatter syntax.

### Checklist before you emit

Search both files' bodies and their `title`, `tldr` and `description` values:
- `—` → none left.
- `: ` and `：` → only after a bold label in a list item, inside a quoted or
  linked title of someone else's work, or in a URL.
- A line ending in `:` or `：` → none (a sentence that introduces a list ends
  with a comma).
- `**….**` or `**…。**` → none. Each bold lead-in is on its own line ending in
  `\`, with the text on the next line.
- Re-count `tldr` and `description` after these edits (YAML rule 4).

## YAML formatting — check BEFORE you output

The frontmatter is parsed as YAML. These are the exact bugs that have broken
past builds — get them right the first time:

### 1. Pick the right quote style for each string value

Look at what the value contains, then quote accordingly:

| Value contains… | Wrap in… | Escape rule |
|-|-|-|
| No `"` and no `'` | `"double"` | none |
| Only `'` (apostrophes) | `"double"` | none |
| Only `"` (a quoted phrase) | `'single'` | none |
| **Both** `"` and `'` | `'single'` | inner `'` → `''` (double it) |

The last row is what silently broke this build three times. Example:

```yaml
tldr: '"Just add a little gamification" sounds like a UX call. It''s actually architectural.'
```

Note the outer single quotes, the inner double quotes kept as literal `"`, and
every apostrophe written as `''`. Never wrap a value with `"..."` when the
string itself contains a `"` — YAML will terminate the string early and choke
on the next character.

### 2. Always a space after every `:`

`tldr: '…'` — with a space. `tldr:'…'` — no space — fails with
"can not read an implicit mapping pair; a colon is missed" at the character
just past the colon.

### 3. Every key needs its label

When editing, never delete the `tldr:` / `description:` prefix by accident. A
bare quoted string with no key in front is parsed as a continuation of the
previous value, and the error message points at a column deep in the wrong
line — hard to debug. Every line inside the `---` fences must be `key: value`.

### 4. Count characters before emitting

The schema enforces hard limits and the build refuses to compile a post that
exceeds them:

- `tldr` — **≤ 400 characters** (schema will reject 401)
- `description` — **≤ 200 characters**

Before you output either value, mentally count. If the tldr is too long, trim
one sentence (usually the middle "context" one). If the description is too
long, drop clauses until it's a single sentence about the point of the post.
Do not output an over-length value expecting the user to catch it — they
usually won't until deploy fails.

## File paths

```
src/content/posts/<category-folder>/<slug>.zh-tw.md
src/content/posts/<category-folder>/<slug>.en.md
```

The **category folder** is the URL slug of the category, which differs from the
display name used in frontmatter. Use this mapping:

| `category:` (frontmatter) | folder      |
| ------------------------- | ----------- |
| `AI`                      | `ai`        |
| `L&D`                     | `l-and-d`   |
| `Builder`                 | `builder`   |
| `Tech`                    | `tech`      |
| `Investment`              | `investment`|
| `Politics`                | `politics`  |
| `Career`                  | `career`    |

## Frontmatter

zh-TW file:

```markdown
---
title: "中文標題"
tldr: "文章的重點摘要，顯示在標題下方、標籤上方。最多 400 字元。這是主要摘要。"
description: "由 tldr 濃縮出的一句話，最多 200 字元。僅供 SEO 與列表卡片使用，不會顯示在文章頁。"
category: "Tech"
tags: ["tag-one", "tag-two"]
publishedAt: YYYY-MM-DD
draft: false
lang: "zh-TW"
translationKey: "<slug>"
---

（正文）
```

en file:

```markdown
---
title: "English Title"
tldr: "The post's key-point summary, shown under the title and above the tags. 400 characters max. This is the primary summary you write."
description: "One sentence condensed from the tldr, 200 characters max. Used only for SEO and listing-card subtitles; not shown on the post page."
category: "Tech"
tags: ["tag-one", "tag-two"]
publishedAt: YYYY-MM-DD
draft: false
lang: "en"
translationKey: "<slug>"
---

(body)
```

## Manual-mode output shape

In manual mode, produce **two** artifacts. Each starts with the save-path
header — that line is a **label for the user**, not part of the file. Example
(English artifact demonstrating safe quoting when the value contains both `"`
and `'`):

```
Save as: src/content/posts/builder/the-safe-example.en.md
---
title: "The safe example"
tldr: '"Just an example" sounds fine. It''s fine because the outer quotes are single, inner quotes stay as ", and every apostrophe is doubled.'
description: 'A single sentence, under 200 characters, condensed from the tldr and safe to parse.'
category: "Builder"
tags: ["writing", "example"]
publishedAt: 2026-09-11
draft: false
lang: "en"
translationKey: "the-safe-example"
---

(body)
```

The zh-TW artifact is the same shape with `Save as: …/the-safe-example.zh-tw.md`,
`lang: "zh-TW"`, and the Chinese title/tldr/description/body. Both share the
same `translationKey`. Traditional Chinese usually has neither `'` nor `"`, so
`title: "中文標題"` (plain double quotes) is fine there.

## Rules the build enforces (get these right or the build fails)

- **`category`** must be exactly one of: `AI`, `L&D`, `Builder`, `Tech`,
  `Investment`, `Politics`, `Career`.
- **`tags`** — lowercase kebab-case only (`web-performance`, not `Web Perf`),
  between 1 and 8.
- **`tldr`** — the primary summary. Write it in the post's language in each
  file, 400 characters or fewer. It renders on the post page between the header
  and the tags. Schema-optional, but this skill always writes one.
- **`description`** — required by the schema, 200 characters or fewer. Derive it
  as a one-sentence condensation of the `tldr` (same language). It feeds the SEO
  `<meta name="description">` and the listing-card subtitles; it is NOT shown on
  the post page when a `tldr` is present. Never leave it out — the build fails
  without it.
- **`translationKey`** — MUST be present and identical in both files. The
  `validate-translations` integration fails the build if a `translationKey` has
  no counterpart in the other language, so always write BOTH files together.
  Use the slug as the key.
- **`publishedAt`** — a date (`YYYY-MM-DD`). Use today unless the user says
  otherwise. `updatedAt` is optional and defaults to `publishedAt`.
- **`lang`** — `"zh-TW"` in the `.zh-tw.md` file, `"en"` in the `.en.md` file.
- Filenames use `.zh-tw.md` / `.en.md` (lowercase). The slug (filename minus the
  `.<lang>` suffix) must match between the two files.

## Notes

- If the user wants a single-language post instead, omit `translationKey` and
  write only one file — but then the 中文/EN toggle on that post won't work.
- Keep both language versions in sync when editing later.
