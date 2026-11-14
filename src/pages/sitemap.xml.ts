import type { APIRoute } from "astro";
import {
  getPostsByLang,
  getCategoryGroups,
  getTagGroups,
  getTranslation,
  postSlug,
  type Lang,
} from "../utils/i18n";

// Prerendered at build time so it ships as a static /sitemap.xml asset.
export const prerender = true;

const ORIGIN = "https://studiounfolding.cc";

interface Entry {
  path: string; // root-relative, e.g. "/about/"
  lastmod?: string; // ISO date
  alternates?: { hreflang: string; path: string }[];
}

const HREFLANG: Record<Lang, string> = { "zh-TW": "zh-Hant-TW", en: "en" };

function abs(path: string): string {
  return ORIGIN + path;
}

export const GET: APIRoute = async () => {
  const entries: Entry[] = [];

  // --- Static pages present in both languages, as hreflang-linked pairs. ---
  const bilingualPairs: [string, string][] = [
    ["/", "/en/"],
    ["/about/", "/en/about/"],
    ["/posts/", "/en/posts/"],
  ];
  for (const [zh, en] of bilingualPairs) {
    const alternates = [
      { hreflang: "zh-Hant-TW", path: zh },
      { hreflang: "en", path: en },
      { hreflang: "x-default", path: zh },
    ];
    entries.push({ path: zh, alternates });
    entries.push({ path: en, alternates });
  }

  // --- Blog posts (both languages), with hreflang alternates when a
  //     translated counterpart exists. ---
  for (const lang of ["zh-TW", "en"] as Lang[]) {
    const prefix = lang === "en" ? "/en" : "";
    for (const post of await getPostsByLang(lang)) {
      const path = `${prefix}/posts/${postSlug(post)}/`;
      const translation = await getTranslation(post);
      const alternates = translation
        ? [
            {
              hreflang: HREFLANG[lang],
              path,
            },
            {
              hreflang: HREFLANG[translation.data.lang],
              path: `${translation.data.lang === "en" ? "/en" : ""}/posts/${postSlug(
                translation,
              )}/`,
            },
          ]
        : undefined;
      entries.push({
        path,
        lastmod: post.data.updatedAt.toISOString(),
        alternates,
      });
    }

    // Category and tag index pages that actually have posts in this language.
    for (const group of await getCategoryGroups(lang)) {
      entries.push({ path: `${prefix}/category/${group.slug}/` });
    }
    for (const group of await getTagGroups(lang)) {
      entries.push({ path: `${prefix}/tag/${group.tag}/` });
    }
  }

  const xmlEntries = entries
    .map((e) => {
      const links = (e.alternates ?? [])
        .map(
          (a) =>
            `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${abs(
              a.path,
            )}" />`,
        )
        .join("\n");
      return [
        "  <url>",
        `    <loc>${abs(e.path)}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        links || null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
