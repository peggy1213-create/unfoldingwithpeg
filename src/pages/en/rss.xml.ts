import { feedRoute } from "../../utils/feed";

// Prerendered at build time so it ships as a static /en/rss.xml asset.
export const prerender = true;

export const GET = feedRoute("en");
