// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import validateTranslations from "./integrations/validate-translations.mjs";

// https://astro.build/config
export default defineConfig({
  // Server-rendered on Cloudflare Workers via the Cloudflare adapter.
  output: "server",
  adapter: cloudflare(),

  // Fail the build if any post's translationKey lacks a counterpart in the
  // other language (see integrations/validate-translations.mjs).
  integrations: [validateTranslations()],

  // Bilingual routing.
  // - zh-TW is the default locale and is served WITHOUT a prefix (at "/").
  // - en is the secondary locale and is served under "/en/".
  // Each language's pages are independent: a missing English page 404s rather
  // than falling back to zh-TW. (A locale `fallback` is deliberately NOT set —
  // it would serve zh-TW content at an /en/ URL for any English category/tag
  // page with no posts in English, which must instead 404, and would surface
  // untranslated posts under /en/ despite the per-post translation linking.)
  i18n: {
    defaultLocale: "zh-TW",
    locales: ["zh-TW", "en"],
    routing: {
      prefixDefaultLocale: false, // zh-TW at "/", en at "/en/"
    },
  },
});
