import type { APIRoute } from "astro";
import { getDb } from "../../../../db";
import { createJob, getJobs } from "../../../../lib/queries";

export const GET: APIRoute = async ({ locals, url }) => {
  const db = getDb((locals as any).runtime.env.DB);
  const status = url.searchParams.get("status") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const tag = url.searchParams.get("tag") ?? undefined;

  const jobs = await getJobs(db, { status, search, tag });
  return new Response(JSON.stringify(jobs), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const db = getDb((locals as any).runtime.env.DB);
  const body = await request.json();

  const job = await createJob(db, {
    id: crypto.randomUUID(),
    company: body.company,
    role: body.role,
    status: body.status || "saved",
    url: body.url || null,
    source: body.source || null,
  });

  return new Response(JSON.stringify(job), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
