import { defineMiddleware } from "astro:middleware";

// Canonical host redirect.
//
// The Worker is bound to both the apex (studiounfolding.cc) and www
// (www.studiounfolding.cc) custom domains, and both would otherwise serve the
// site independently. To avoid duplicate-content ambiguity we pick the apex as
// canonical and 301-redirect any www request to it, preserving the path and
// query string.
const CANONICAL_HOST = "studiounfolding.cc";

export const onRequest = defineMiddleware((context, next) => {
  const url = context.url;

  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    return context.redirect(url.toString(), 301);
  }

  return next();
});
