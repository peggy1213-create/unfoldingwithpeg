import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const POSTS_DIR = fileURLToPath(new URL("../src/content/posts", import.meta.url));

/** Recursively collect every .md file under `dir`. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

/** Pull a scalar frontmatter value out of the leading `---` block. */
function frontmatterValue(source, key) {
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return undefined;
  const line = fm[1]
    .split(/\r?\n/)
    .find((l) => new RegExp(`^${key}\\s*:`).test(l.trim()));
  if (!line) return undefined;
  return line
    .slice(line.indexOf(":") + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
}

/**
 * Astro integration that fails the build when a post declares a
 * `translationKey` but no post in the *other* language shares it. Catches
 * broken translation links (typos, deleted counterparts) before they ship.
 */
export default function validateTranslations() {
  return {
    name: "validate-translations",
    hooks: {
      "astro:build:start": ({ logger }) => {
        // key -> Set<lang>, and key -> list of files (for error messages)
        const langsByKey = new Map();
        const filesByKey = new Map();

        for (const file of walk(POSTS_DIR)) {
          const source = readFileSync(file, "utf8");
          const key = frontmatterValue(source, "translationKey");
          if (!key) continue;
          const lang = frontmatterValue(source, "lang");
          const rel = relative(POSTS_DIR, file).split(sep).join("/");

          if (!langsByKey.has(key)) {
            langsByKey.set(key, new Set());
            filesByKey.set(key, []);
          }
          if (lang) langsByKey.get(key).add(lang);
          filesByKey.get(key).push(rel);
        }

        const errors = [];
        for (const [key, langs] of langsByKey) {
          if (!(langs.has("zh-TW") && langs.has("en"))) {
            const have = [...langs].join(", ") || "(none)";
            errors.push(
              `  translationKey "${key}" has no counterpart in the other language ` +
                `(languages present: ${have}); files: ${filesByKey.get(key).join(", ")}`,
            );
          }
        }

        if (errors.length > 0) {
          const message =
            `Broken translation link(s) — every translationKey must exist in ` +
            `both zh-TW and en:\n${errors.join("\n")}`;
          logger.error(message);
          throw new Error(message);
        }

        logger.info(
          `translationKey check passed (${langsByKey.size} translation pair(s)).`,
        );
      },
    },
  };
}
