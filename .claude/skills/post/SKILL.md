---
name: post
description: >-
  Turn a conversation into a blog post for the unfoldingwithpeg site
  (Astro, bilingual zh-TW / en). Proposes frontmatter that matches the
  posts content collection schema, then writes a schema-valid Markdown
  file (CLI) or emits it as an artifact (claude.ai). Use when the user
  says "turn this into a post", "make this a blog post", "寫成文章",
  "post this", "draft a post from our chat", or "translate to en / zh-TW".
---

# Conversation → blog post (unfoldingwithpeg)

Turn the current conversation into a publish-ready blog post for the
`unfoldingwithpeg` Astro site. The site is bilingual: Traditional Chinese
(`zh-TW`, served at `/`) and English (`en`, served at `/en/`). Each post is
one Markdown file **per language**.

The skill runs in two modes. It figures out which one automatically (see
Step 0) — you don't ask the user which environment they're in.

- **CLI mode** (Claude Code, repo on disk): read the live schema, write the
  `.md` file(s) to disk, `git add` them.
- **claude.ai mode** (Skills settings, no repo): use the embedded schema
  below and output each complete file as an artifact with a `Save as:` header
  so the user can drop it into their repo.

---

## Flow

### Step 0 — Detect environment (dual-mode)

Try to read `src/content.config.ts` (fall back to `src/content/config.ts`).

- **Read succeeds → CLI mode.** Use the live schema from that file. Write
  files to disk and stage them with `git add`. Run the Schema-drift check and
  the Existing-tag lookup below.
- **Read fails (no such file / not in the repo) → claude.ai mode.** Use the
  **Embedded schema** below. Output each complete file as an artifact whose
  first line is `Save as: <repo-relative path>`. Skip the git step, the
  schema-drift check, and the shell-based tag lookup (no filesystem access).

### Step 1 — Read the conversation

Identify the substantive idea(s) worth publishing. A post needs a real thesis,
not a transcript. Pull out the argument, the examples, and the takeaways;
discard the back-and-forth, false starts, and meta-chatter.

If the conversation has no publishable substance yet, say so and ask the user
what angle they want, rather than padding a thin post.

### Step 2 — Propose metadata (confirm before writing)

Propose the frontmatter and **wait for the user to confirm or edit** before
generating the post. Present it as a compact block:

```
title:          <compelling, specific — not a summary of the chat>
description:    <≤ 200 chars; a hook, not a recap>
category:       <exactly one of the 7 — see reference>
tags:           <1–8, lowercase kebab-case>
publishedAt:    <today, YYYY-MM-DD, unless the user gives a date>
draft:          <true unless the user says publish>
lang:           <zh-TW | en — the conversation's language>
translationKey: <slug — reserved; only written when both languages exist>
folder / slug:  <category-folder>/<slug>
file path:      src/content/posts/<folder>/<slug>.<lang>.md
```

In CLI mode, show the **existing tags** (from the lookup below) alongside the
proposed tags so the user reuses established tags instead of coining
near-duplicates (e.g. don't add `learning` when `learning-design` exists).

### Step 3 — Generate the post

After confirmation, write the post body in the conversation's language:

- Open with a short hook (the site renders a leading `>` blockquote as a lede).
- Use `##` section headings. Keep paragraphs tight.
- Write real prose from the conversation's substance — **no placeholder text**.
- Don't restate the frontmatter title as an H1; the layout renders the title.

### Step 4 — Output

- **CLI mode:** write to `src/content/posts/<folder>/<slug>.<lang>.md`, then
  `git add` the file. Tell the user the path and whether it's a draft.
- **claude.ai mode:** emit the file as an artifact whose first line is
  `Save as: src/content/posts/<folder>/<slug>.<lang>.md`, followed by the full
  file contents (frontmatter + body).

---

## Schema-drift check (CLI mode only)

After reading the live schema in Step 0, compare it against the **Embedded
schema** below (category enum, tag rules, required fields, lang values).

- If they differ, **warn the user with a short diff** before proposing
  metadata — e.g. "Live schema has a new category `Health` not in my embedded
  copy" or "`description` max is now 240, embedded says 200".
- **Do not block.** Let the user decide: update the embedded schema in this
  file, or proceed using the live schema as the source of truth (the live
  schema always wins for what actually validates).

---

## Embedded schema (fallback for claude.ai mode)

Mirrors `src/content.config.ts`. In claude.ai mode this is the source of truth;
in CLI mode the live file wins and this is only the drift-check baseline.

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Kebab-case, lowercase, no leading/trailing/double dashes (e.g. "learning-design").
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/posts",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z
    .object({
      title: z.string(),
      description: z.string().max(200, "description must be ≤ 200 characters"),
      category: z.enum([
        "AI",
        "L&D",
        "Builder",
        "Tech",
        "Investment",
        "Politics",
        "Career",
      ]),
      tags: z
        .array(z.string().regex(KEBAB, "tags must be lowercase kebab-case"))
        .min(1, "at least 1 tag is required")
        .max(8, "at most 8 tags are allowed"),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      draft: z.boolean().default(true),
      lang: z.enum(["zh-TW", "en"]),
      translationKey: z.string().optional(),
    })
    // updatedAt defaults to publishedAt when omitted.
    .transform((data) => ({
      ...data,
      updatedAt: data.updatedAt ?? data.publishedAt,
    })),
});

export const collections = { posts };
```

### Category → folder-slug reference

The `category` frontmatter is the **display name**; the folder is its **slug**.
Use exactly these seven — a value outside the enum fails validation:

| category (display) | folder slug   |
| ------------------ | ------------- |
| AI                 | `ai`          |
| L&D                | `l-and-d`     |
| Builder            | `builder`     |
| Tech               | `tech`        |
| Investment         | `investment`  |
| Politics           | `politics`    |
| Career             | `career`      |

### File naming

`src/content/posts/<folder-slug>/<slug>.<lang>.md`

- `<slug>`: lowercase kebab-case, derived from the title.
- `<lang>` **in the filename** is lowercase: `zh-tw` or `en`
  (e.g. `why-astro.zh-tw.md`), while the `lang` **frontmatter** value keeps its
  canonical casing (`zh-TW` or `en`). The two versions of a bilingual post share
  the same folder and slug; only the `.<lang>.md` suffix differs.

---

## Bilingual behavior

### Default: write the conversation's language only

Produce **one** file, in the language the conversation is in.

- Compute the `translationKey` (= the slug) and **reserve** it, but **do not
  write it into a monolingual file.** The build's `validate-translations`
  integration fails if a `translationKey` has no counterpart in the other
  language, so a lone file must omit it. Tell the user the reserved key.
- Tell the user: *"This is a `<lang>`-only post. Run me again with 'translate
  to en' (or 'translate to zh-TW') and I'll write the counterpart natively and
  add `translationKey: <key>` to both files. Or leave it monolingual — the site
  handles single-language posts fine."*

### On explicit request ("write both languages" / "寫兩個語言版本")

Produce **two** files in one run:

- Same folder and slug; only the `.<lang>.md` suffix differs.
- Add the shared `translationKey` (= the slug) to **both** files — now it has a
  counterpart, so the build passes.
- **Do not machine-translate.** Write each language version **natively** from
  the conversation's substance — idiomatic in each language, not a literal
  rendering of the other.
- If the conversation exists in only one language, **ask the user for the key
  points** (or a rough draft) for the other language rather than
  auto-translating. Only produce the second file once you have real material.

### Adding a counterpart later ("translate to en")

When asked to add the other language to an existing post:

1. Locate the existing file and its slug/folder.
2. Write the counterpart natively (ask for key points if the conversation lacks
   that language — don't auto-translate).
3. Add `translationKey: <slug>` to **both** the existing file and the new one so
   the pair validates.

---

## Existing tag lookup (CLI mode only)

Before proposing tags, list the tags already in use so the user reuses them:

```bash
grep -rh "^tags:" src/content/posts/**/*.md | tr -d '[]"' | tr ',' '\n' | sort -u
```

Show the result in the Step-2 metadata proposal. Prefer an existing tag over a
new near-duplicate.

---

## Reference: minimal valid frontmatter

```yaml
---
title: "Building From First Principles"
description: "How to decompose a product problem to its irreducible assumptions and rebuild from there."
category: "Builder"
tags: ["builder", "first-principles", "product"]
publishedAt: 2026-06-30
draft: false
lang: "en"
# translationKey: "building-from-first-principles"  # only when a counterpart exists
---

> A one-line lede rendered as the post's opening blockquote.

Opening paragraph…

## First section

Body…
```

Notes:

- `draft: true` (the schema default) keeps a post out of the listings until the
  user says publish; set `draft: false` only when they confirm.
- `updatedAt` is optional and defaults to `publishedAt` — omit it on a new post.
- `publishedAt` accepts a plain `YYYY-MM-DD` date.
