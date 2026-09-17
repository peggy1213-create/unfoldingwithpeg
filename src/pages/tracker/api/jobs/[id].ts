import type { APIRoute } from "astro";
import { getDb } from "../../../../db";
import {
  getJobById,
  updateJob,
  deleteJob,
  getEventsByJobId,
  deleteEvent,
} from "../../../../lib/queries";

export const GET: APIRoute = async ({ params, locals }) => {
  const db = getDb((locals as any).runtime.env.DB);
  const job = await getJobById(db, params.id!);
  if (!job) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const events = await getEventsByJobId(db, params.id!);
  return new Response(JSON.stringify({ ...job, events }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ params, locals, request }) => {
  const db = getDb((locals as any).runtime.env.DB);
  const body = await request.json();
  const job = await updateJob(db, params.id!, body);
  if (!job) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(job), {
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = getDb((locals as any).runtime.env.DB);
  const job = await getJobById(db, params.id!);
  if (!job) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const events = await getEventsByJobId(db, params.id!);
  for (const ev of events) {
    await deleteEvent(db, ev.id);
  }
  await deleteJob(db, params.id!);
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
