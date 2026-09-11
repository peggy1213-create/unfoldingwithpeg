// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // Server-rendered on Cloudflare Workers via the Cloudflare adapter.
  output: "server",
  adapter: cloudflare(),

  // Bilingual routing.
  // - zh-TW is the default locale and is served WITHOUT a prefix (at "/").
  // - en is the secondary locale and is served under "/en/".
  // - English routes that don't exist fall back to their zh-TW equivalent.
  i18n: {
    defaultLocale: "zh-TW",
    locales: ["zh-TW", "en"],
    routing: {
      prefixDefaultLocale: false, // zh-TW at "/", en at "/en/"
    },
    fallback: {
      en: "zh-TW", // en → zh-TW when an English page is missing
    },
  },
});
