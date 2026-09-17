import type { APIRoute } from "astro";
import { getDb } from "../../../db";
import { createEvent, getEventsWithJobs } from "../../../lib/queries";

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const type = url.searchParams.get("type") || undefined;

  const events = await getEventsWithJobs(db, offset, limit, type);
  return new Response(JSON.stringify(events), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const db = getDb();
  const body = await request.json();

  const event = await createEvent(db, {
    id: crypto.randomUUID(),
    job_id: body.job_id,
    type: body.type,
    title: body.title,
    date: body.date || new Date().toISOString(),
    description: body.description || null,
    reminder_at: body.reminder_at || null,
  });

  return new Response(JSON.stringify(event), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
