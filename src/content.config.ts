import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Kebab-case, lowercase, no leading/trailing/double dashes (e.g. "learning-design").
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Blog posts, one Markdown file per language:
 *   src/content/posts/<folder-slug>/<slug>.<lang>.md
 *
 * The glob loader derives each entry `id` from its path relative to `base`
 * with the `.md` extension removed, e.g. "tech/why-astro.zh-tw". The clean URL
 * slug and language are recovered from that id / frontmatter in src/utils/i18n.ts.
 */
const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/posts",
    // Keep the raw path (minus ".md") as the id, e.g. "tech/why-astro.zh-tw".
    // The default generator slugifies the id and drops the "." before the lang
    // suffix ("why-astroen"), which breaks slug/lang recovery in i18n.ts.
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
      // Shared across the zh-TW and en versions of the same post. Absent when a
      // post exists in only one language. Cross-file consistency (every key has
      // a counterpart in the other language) is enforced at build time by the
      // "validate-translations" integration in astro.config.mjs.
      translationKey: z.string().optional(),
    })
    // updatedAt defaults to publishedAt when omitted.
    .transform((data) => ({
      ...data,
      updatedAt: data.updatedAt ?? data.publishedAt,
    })),
});

export const collections = { posts };
