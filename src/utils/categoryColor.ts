/**
 * One accent colour per post category (the fixed list in content.config.ts),
 * shared by the knowledge map, post pages and related-post cards so a topic
 * reads as the same colour everywhere.
 */
const COLORS: Record<string, string> = {
  AI: "var(--uwp-blue-400)",
  "L&D": "var(--uwp-rose-400)",
  Builder: "var(--uwp-success-500)",
  Tech: "var(--uwp-blue-700)",
  Investment: "var(--uwp-warning-500)",
  Politics: "var(--uwp-danger-500)",
  Career: "var(--uwp-neutral-500)",
};

export function categoryColor(name: string): string {
  return COLORS[name] ?? "var(--uwp-neutral-500)";
}
