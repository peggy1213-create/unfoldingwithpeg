import { getCollection, type CollectionEntry } from "astro:content";

export type Lang = "zh-TW" | "en";
export type Post = CollectionEntry<"posts">;

/**
 * Clean URL slug for a post, i.e. the filename with the folder prefix and the
 * `.<lang>` suffix stripped: "tech/why-astro.zh-tw" → "why-astro".
 */
export function postSlug(post: Post): string {
  const base = post.id.split("/").pop() ?? post.id;
  return base.replace(/\.(zh-tw|en)$/i, "");
}

/** Non-draft posts in the given language, newest first. */
export async function getPostsByLang(lang: Lang): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    (p) => !p.data.draft && p.data.lang === lang,
  );
  return posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

/**
 * The counterpart post in the other language, or null when this post has no
 * translationKey or no published counterpart. Used by LangSwitcher on post
 * pages so the toggle points at the translated article (and hides otherwise).
 */
export async function getTranslation(post: Post): Promise<Post | null> {
  const key = post.data.translationKey;
  if (!key) return null;

  const other: Lang = post.data.lang === "zh-TW" ? "en" : "zh-TW";
  const matches = await getCollection(
    "posts",
    (p) => !p.data.draft && p.data.lang === other && p.data.translationKey === key,
  );
  return matches[0] ?? null;
}
