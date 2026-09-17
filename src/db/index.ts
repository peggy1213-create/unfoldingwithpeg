import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "./schema";

export function getDb(d1?: D1Database) {
  const binding = d1 ?? (env as any).DB;
  return drizzle(binding, { schema });
}
