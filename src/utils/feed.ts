import type { APIRoute } from "astro";
import { getPostsByLang, postHref, type Lang, type Post } from "./i18n";
import { FEED_IMAGE } from "./brand";

/**
 * RSS 2.0 feeds, one per language: /rss.xml (zh-TW) and /en/rss.xml (en).
 *
 * Hand-rolled rather than via `@astrojs/rss`, for the same reason
 * `sitemap.xml.ts` is: it is a few lines of XML, and it keeps the dependency
 * list to Astro + the Cloudflare adapter + Drizzle.
 *
 * Two feeds rather than one mixed feed, so a subscriber on either side does not
 * receive the other language's translation of a post they have already read —
 * the same separation the sitemap's hreflang pairs express.
 */

/** Channel-level metadata for one language's feed. */
interface Channel {
  /** <title> — also the `title` of the <link rel="alternate"> in the head. */
  title: string;
  /** <description>. */
  description: string;
  /** Root-relative path of the human-readable index this feed mirrors. */
  link: string;
  /** Root-relative path of the feed itself (for the atom:link rel="self"). */
  path: string;
  /** <language> value. */
  language: string;
}

export const FEED_CHANNELS: Record<Lang, Channel> = {
  "zh-TW": {
    title: "unfolding with Peg — 知識庫",
    description:
      "謝佩君（Peggy）寫 AI、學習設計、產品與獨立開發。新文章優先。",
    link: "/posts/",
    path: "/rss.xml",
    language: "zh-tw",
  },
  en: {
    title: "unfolding with Peg — Writing",
    description:
      "Peggy Pei-Chun Hsieh on learning design, AI, products, and building solo. Newest first.",
    link: "/en/posts/",
    path: "/en/rss.xml",
    language: "en",
  },
};

// Same fallback as BaseLayout.astro: `site` is set in astro.config.mjs, this
// only covers a context that somehow has none.
const FALLBACK_SITE = new URL("https://studiounfolding.cc");

/** Escape a string for use in an XML text node or attribute value. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function itemXml(post: Post, abs: (path: string) => string): string {
  const url = abs(postHref(post));
  // Prefer the post's TL;DR where it has one: a feed item is read without the
  // page around it, so the fuller summary serves better than the meta subtitle.
  const summary = post.data.tldr ?? post.data.description;
  const categories = [post.data.category, ...post.data.tags].map(
    (c) => `    <category>${xml(c)}</category>`,
  );
  return [
    "  <item>",
    `    <title>${xml(post.data.title)}</title>`,
    `    <link>${xml(url)}</link>`,
    `    <guid isPermaLink="true">${xml(url)}</guid>`,
    // RFC-822 date, as RSS requires. `toUTCString()` emits exactly that shape.
    `    <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>`,
    `    <description>${xml(summary)}</description>`,
    ...categories,
    "  </item>",
  ].join("\n");
}

/** Build the GET handler for one language's feed. */
export function feedRoute(lang: Lang): APIRoute {
  return async (context) => {
    const site = context.site ?? FALLBACK_SITE;
    const abs = (path: string) => new URL(path, site).href;
    const channel = FEED_CHANNELS[lang];

    const posts = await getPostsByLang(lang); // published, newest first

    // Derived from the content rather than from `Date.now()`, so rebuilding
    // without publishing produces a byte-identical feed.
    const lastBuildDate = posts.length
      ? new Date(
          Math.max(...posts.map((p) => p.data.updatedAt.getTime())),
        ).toUTCString()
      : undefined;

    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      "<channel>",
      `  <title>${xml(channel.title)}</title>`,
      `  <link>${xml(abs(channel.link))}</link>`,
      `  <description>${xml(channel.description)}</description>`,
      `  <language>${channel.language}</language>`,
      `  <atom:link rel="self" type="application/rss+xml" href="${xml(
        abs(channel.path),
      )}" />`,
      lastBuildDate ? `  <lastBuildDate>${lastBuildDate}</lastBuildDate>` : null,
      // Channel avatar. Per the RSS spec the nested title/link must repeat the
      // channel's own, so a reader that renders the image as a link matches.
      "  <image>",
      `    <url>${xml(abs(FEED_IMAGE.path))}</url>`,
      `    <title>${xml(channel.title)}</title>`,
      `    <link>${xml(abs(channel.link))}</link>`,
      `    <width>${FEED_IMAGE.width}</width>`,
      `    <height>${FEED_IMAGE.height}</height>`,
      "  </image>",
      ...posts.map((post) => itemXml(post, abs)),
      "</channel>",
      "</rss>",
      "",
    ]
      .filter((line) => line !== null)
      .join("\n");

    return new Response(body, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  };
}
