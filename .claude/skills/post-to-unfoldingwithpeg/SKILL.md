---
name: "post-to-unfoldingwithpeg"
description: "Publish a confirmed zh-TW + English post pair to Peggy's site studiounfolding.cc via the unfoldingwithpeg GitHub repo, either immediately or scheduled for a future date, then verify the live pages."
---

# Publish a post pair to studiounfolding.cc

Publish the zh-TW and English versions of a post that Peggy has confirmed as
final. The site is built from the GitHub repo `peggy1213-create/unfoldingwithpeg`
and served at **studiounfolding.cc** (zh-TW at `/posts/<slug>/`, English at
`/en/posts/<slug>/`). If Peggy says "unfoldingwithpeg.cc", she means this site;
say once that the live domain is studiounfolding.cc.

How publishing works: every push to `main` runs `.github/workflows/deploy.yml`
("Deploy to Cloudflare"), which runs `npm run deploy` (`astro build && wrangler
deploy`). The same workflow also runs on a schedule, three times a day. So
publishing means getting both files onto `main` in one go, then checking the
deploy and the live pages.

A post is visible only once a build runs at or after its `publishedAt`. Every
public route is prerendered, so the build is what puts a post live, and
`isLive()` in `src/utils/i18n.ts` filters out any post whose `publishedAt` has
not arrived. That is what makes scheduling work, and it changes several steps
below. Decide first which of the two cases you are in:

- **Publish now:** `publishedAt` is today or earlier. The merge deploy puts the
  post live within about a minute. This is the default when Peggy has not asked
  for a date.
- **Schedule:** `publishedAt` is in the future. The merge deploy ships the site
  *without* the post, and one of the scheduled builds puts it live later. Only
  schedule when Peggy asked for a date or time.

## 0. Only publish confirmed text

- Publish exactly the version Peggy confirmed. Asking for this skill is the
  go-ahead to publish that version, including committing and merging on GitHub.
- Get the final text from the newest source:
  - If a post editor artifact was used, read its saved files with the Artifact
    tool (`action: "read"`, `paths` for both `.md` files). Her saved edits there
    are the final text, even if they differ from what you drafted.
  - Otherwise use the files or drafts from the conversation.
- If it is unclear which version is final, or only one language exists, show
  what you have and ask before publishing anything.
- If it is unclear whether she wants it live now or on a date, ask before
  publishing. Guessing a future date hides the post; guessing today publishes
  something she meant to hold.

## 1. Pre-flight checks (both files)

Fix problems before publishing, and tell Peggy about any change you made to
her text.

- **Paths:** `src/content/posts/<category-folder>/<slug>.zh-tw.md` and
  `src/content/posts/<category-folder>/<slug>.en.md`, same slug. Folder mapping:
  AI→`ai`, L&D→`l-and-d`, Builder→`builder`, Tech→`tech`,
  Investment→`investment`, Politics→`politics`, Career→`career`.
- **Frontmatter:** `title`, `tldr` (≤ 400 chars), `description` (≤ 200 chars),
  `category` (one of the seven), `tags` (1–8, lowercase kebab-case),
  `publishedAt` (see below), `draft: false`, `lang` (`"zh-TW"` / `"en"`),
  `translationKey` identical in both files (use the slug).
- **`publishedAt`:** `YYYY-MM-DD` to publish on the merge deploy. To schedule,
  give a full timestamp with her offset, for example
  `publishedAt: 2026-12-01T09:00:00+08:00`. Both files must carry the same
  value, or one language appears before the other.
- **`draft`:** `draft: false` for anything being published. `draft: true` hides
  a post everywhere, the dev server included, whatever its date; it is not the
  way to schedule.
- **YAML quoting:** a value containing `"` is wrapped in single quotes, with
  inner `'` doubled. A space follows every key's colon.
- **House style** (same rules as the write-post skill): no em dashes; no colons
  inside sentences except after a bold label in a list item, inside someone
  else's real title, or in URLs; bold lead-in headings have no trailing `.` or
  `。` and end with `\` so the text starts on the next line.

## 1a. Choosing a scheduled time

Only when Peggy asked for a date. The scheduled builds run at **09:17, 13:17
and 21:17 Asia/Taipei**. A post goes live at the first slot at or after its
`publishedAt`, so set `publishedAt` to just before the slot she wants, such as
`09:00+08:00` for the morning build.

Tell her the slot her date lands on, not just the date. Expect a few minutes
beyond it: GitHub makes no on-time guarantee for scheduled runs, and they are
often several minutes late. If she needs a post live at an exact minute, say
that this cannot do it, and offer either the nearest slot or publishing by hand
at that moment (**Actions → Deploy to Cloudflare → Run workflow**).

## 2. Build it before publishing

1. Attach the repo (`add_repo` owner `peggy1213-create`, repo `unfoldingwithpeg`,
   access `push`) and clone it shallow into the workspace. Note the result's
   `push_check`.
2. Copy both files into place, then run `npm ci` and `npx astro build`.
3. The build must pass. It fails if a `translationKey` has no partner file, a
   frontmatter value breaks the schema, or YAML is malformed. Fix and rebuild.
   These checks read every post file whatever its date, so they catch a
   scheduled post too.
4. Confirm the rendered HTML, but expect a different result in each case:
   - **Publishing now:** `dist/client/posts/<slug>/` and
     `dist/client/en/posts/<slug>/` exist (for example,
     `<strong>Heading</strong><br>` for bold lead-ins).
   - **Scheduled:** those directories are **absent**, and the post is in no
     feed, tag page or sitemap entry. That is the gate working, not a failure.
     Do not "fix" it by moving the date into the past. To see a scheduled post
     rendered, run `npm run dev` and open it there: the dev server ignores the
     date on purpose, so the page exists locally while staying unpublished.

## 3. Publish

Both languages must reach `main` together. Never commit one language alone to
`main`: that deploy fails the translation check.

### Route A: git push works (`push_check` was not refused)

Commit both files in one commit on `main` (message `Add post: <English title>
(zh-TW + en)`), fetch `origin main` first so the push is small, then push.
Use the session's commit attribution lines.

### Route B: push refused, so use the built-in browser and Peggy's GitHub sign-in

Load the built-in-browser skill first. Her browser is signed in to GitHub.

1. Open `https://github.com/peggy1213-create/unfoldingwithpeg/new/main/src/content/posts/<folder>`.
2. Set the filename with `find` "Name your file" then `form_input`
   (`<slug>.zh-tw.md`).
3. Fill the editor. GitHub's editor is CodeMirror. Typing breaks Markdown
   (auto-closed brackets and quotes), and its view object is not reachable. What
   works is a synthetic paste:
   ```js
   const c = document.querySelector('.cm-content'); c.focus();
   const dt = new DataTransfer(); dt.setData('text/plain', md);
   c.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true}));
   ```
   - Put the Markdown in a JS string. `String.raw` with a template literal keeps
     the `\` line breaks, as long as the text has no backticks or `${`.
     Otherwise use a JSON string literal.
   - To clear an editor that already has text, click inside it, then press
     `ctrl+a` and `Delete` with the `computer` tool. `document.execCommand('selectAll')`
     does not work. An empty editor still reports the 24-character placeholder
     "Enter file contents here".
   - The editor renders only visible lines, so verify with `md.length` and the
     line count against the local file, not the DOM text.
4. Click "Commit changes...". Set the commit message. Choose "Create a new
   branch for this commit and start a pull request" and name the branch
   `post/<slug>`. Copilot may fill the extended description; that is only commit
   history. Click "Propose changes".
5. Open `…/new/post/<slug>/src/content/posts/<folder>`, add `<slug>.en.md` the
   same way, and commit directly to the `post/<slug>` branch.
6. Before merging, confirm the branch matches the built files exactly:
   `git fetch --depth 1 origin post/<slug>`, then
   `cmp <(git show FETCH_HEAD:<path>) <local file>` for both files.
7. Open `…/compare/main...post/<slug>?expand=1`. Set the title
   `Add post: <English title> (zh-TW + en)` and click "Create pull request".
   Then click "Merge pull request" and "Confirm merge". If a click only
   scrolls the page, take a screenshot and click the button by coordinates.
8. Confirm the merge landed with `git fetch origin main` and `git log`.

**The pull request runs a build check.** `.github/workflows/build-check.yml`
runs `npm ci && npm run build` on every pull request into `main`. Wait for it
to pass before merging in step 7; it usually takes under a minute. If it fails,
read the run and fix the post rather than merging. It catches the same things
as the local build, so a post that built cleanly in step 2 should pass.

### Editing a post that is already live

Same routes. In Route B, open `…/edit/main/<path>` for each file. On the
branch, use `…/edit/post/<slug>/<path>` for the second file. Clear the editor,
paste the full new text, then compare the merged file's hash with the local
file's.

Do not give a live post a future `publishedAt` to "unpublish" it: the next
build removes it from the site, which is rarely what she means. To take a post
down, ask her first.

## 4. Watch the deploy

Open `https://github.com/peggy1213-create/unfoldingwithpeg/actions/workflows/deploy.yml`
and find the run for the merge commit. Deploys usually finish in under a
minute. Wait in short steps, then reload. If the run fails, open it, read the
error, and report it. Do not retry blindly.

For a scheduled post, this run must still succeed, but it ships the site
without the post. A green run here means the post is safely on `main` and
waiting for its slot, not that it is live.

## 5. Check the live pages

Use the built-in browser (`request_access` for `https://studiounfolding.cc`,
scope `site`, if asked). WebFetch is often blocked for this host; in a cloud
session `curl` works only if the environment's network policy allows the host.

**Publishing now:** open `https://studiounfolding.cc/posts/<slug>/` and check:
- the `h1` is the zh-TW title and the `h2` headings are right;
- the English page (`/en/posts/<slug>/`, fetch it from the same tab) returns
  200 with the English title;
- bold lead-ins render as `<strong>` followed by `<br>`.

**Scheduled:** both pages should 404 right now, which is correct. Do not report
it as a problem and do not wait for the slot. Confirm instead that the post is
on `main` (step 3.8) and that the merge deploy was green (step 4), then tell
her when it will appear. The same checks above apply once it is live, so offer
to verify after the slot.

## 6. Finish

- Leave the local clone clean. If files you published are still untracked or
  modified there, confirm they match `main` byte for byte, then reset the clone
  to `origin/main`. Never leave unpublished work behind.
- Tell Peggy in a few lines: the PR number (Route B), that the deploy
  succeeded, and anything you changed during pre-flight. Then either the two
  live links (publishing now), or the date, the slot and the two links that
  will work from then (scheduled).
- If a post editor artifact exists, remind her that later edits there need
  publishing again with this skill.
