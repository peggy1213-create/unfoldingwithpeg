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

/**
 * Folder slug of a post's category, i.e. the first path segment of its id:
 * "tech/why-astro.zh-tw" → "tech". This is the URL key used by /category/…,
 * distinct from the human display name in `post.data.category` ("Tech").
 */
export function categorySlug(post: Post): string {
  return post.id.split("/")[0];
}

/** Canonical URL of a post's own page, in the post's language. */
export function postHref(post: Post): string {
  return post.data.lang === "en"
    ? `/en/posts/${postSlug(post)}/`
    : `/posts/${postSlug(post)}/`;
}

/** URL of a category index page in the given language. */
export function categoryHref(slug: string, lang: Lang): string {
  return lang === "en" ? `/en/category/${slug}/` : `/category/${slug}/`;
}

/** URL of a tag index page in the given language. */
export function tagHref(tag: string, lang: Lang): string {
  return lang === "en" ? `/en/tag/${tag}/` : `/tag/${tag}/`;
}

/** One category's posts (newest first), keyed by folder slug + display name. */
export interface CategoryGroup {
  slug: string; // folder slug, e.g. "l-and-d"
  name: string; // display name, e.g. "L&D"
  posts: Post[]; // newest first
}

/**
 * Non-draft posts in `lang` grouped by category. Posts within a group are
 * newest first; groups are ordered by their most recent post (newest first).
 * Only categories with at least one post appear.
 */
export async function getCategoryGroups(lang: Lang): Promise<CategoryGroup[]> {
  const posts = await getPostsByLang(lang); // already newest first
  const groups = new Map<string, CategoryGroup>();
  for (const post of posts) {
    const slug = categorySlug(post);
    const group = groups.get(slug);
    if (group) {
      group.posts.push(post);
    } else {
      groups.set(slug, { slug, name: post.data.category, posts: [post] });
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      b.posts[0].data.publishedAt.getTime() -
      a.posts[0].data.publishedAt.getTime(),
  );
}

/** One tag's posts (newest first). */
export interface TagGroup {
  tag: string;
  posts: Post[]; // newest first
}

/**
 * Non-draft posts in `lang` grouped by tag (a post appears under each of its
 * tags). Posts within a group are newest first; groups are ordered by tag name.
 * Only tags that appear on at least one post appear.
 */
export async function getTagGroups(lang: Lang): Promise<TagGroup[]> {
  const posts = await getPostsByLang(lang); // already newest first
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const arr = groups.get(tag);
      if (arr) arr.push(post);
      else groups.set(tag, [post]);
    }
  }
  return [...groups.entries()]
    .map(([tag, posts]) => ({ tag, posts }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
