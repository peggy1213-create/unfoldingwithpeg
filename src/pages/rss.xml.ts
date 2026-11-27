import { feedRoute } from "../utils/feed";

// Prerendered at build time so it ships as a static /rss.xml asset.
export const prerender = true;

export const GET = feedRoute("zh-TW");
