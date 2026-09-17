import { eq, desc, and, like, or, sql, lte, inArray } from "drizzle-orm";
import { jobs, events, contacts, jobContacts } from "../db/schema";
import type { getDb } from "../db";

type Db = ReturnType<typeof getDb>;

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function createJob(
  db: Db,
  data: typeof jobs.$inferInsert,
) {
  const now = new Date().toISOString();
  return db
    .insert(jobs)
    .values({ ...data, created_at: now, updated_at: now })
    .returning()
    .then((r) => r[0]);
}

export async function updateJob(
  db: Db,
  id: string,
  data: Partial<Omit<typeof jobs.$inferInsert, "id" | "created_at">>,
) {
  const now = new Date().toISOString();

  if (data.status) {
    const existing = await db.select({ status: jobs.status }).from(jobs).where(eq(jobs.id, id)).then((r) => r[0]);
    if (existing && existing.status !== data.status) {
      await createEvent(db, {
        id: crypto.randomUUID(),
        job_id: id,
        type: "status_change",
        title: `Status changed to ${data.status}`,
        date: now,
      });
    }
  }

  return db
    .update(jobs)
    .set({ ...data, updated_at: now })
    .where(eq(jobs.id, id))
    .returning()
    .then((r) => r[0]);
}

export async function deleteJob(db: Db, id: string) {
  return db.delete(jobs).where(eq(jobs.id, id));
}

export async function getJobs(
  db: Db,
  filters?: { status?: string; tag?: string; search?: string },
) {
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(jobs.status, filters.status));
  }
  if (filters?.tag) {
    conditions.push(like(jobs.tags, `%${filters.tag}%`));
  }
  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(like(jobs.company, term), like(jobs.role, term), like(jobs.notes, term))!,
    );
  }

  const query = conditions.length
    ? db.select().from(jobs).where(and(...conditions))
    : db.select().from(jobs);

  return query.orderBy(desc(jobs.updated_at));
}

export async function getJobById(db: Db, id: string) {
  return db.select().from(jobs).where(eq(jobs.id, id)).then((r) => r[0]);
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function createEvent(
  db: Db,
  data: typeof events.$inferInsert,
) {
  return db
    .insert(events)
    .values(data)
    .returning()
    .then((r) => r[0]);
}

export async function deleteEvent(db: Db, id: string) {
  return db.delete(events).where(eq(events.id, id));
}

export async function getEventsByJobId(db: Db, jobId: string) {
  return db
    .select()
    .from(events)
    .where(eq(events.job_id, jobId))
    .orderBy(desc(events.date));
}

export async function getRecentEvents(db: Db, limit = 10) {
  return db
    .select()
    .from(events)
    .orderBy(desc(events.date))
    .limit(limit);
}

export async function getEventsPaginated(
  db: Db,
  offset: number,
  limit: number,
  typeFilter?: string,
) {
  const condition = typeFilter ? eq(events.type, typeFilter) : undefined;
  const query = condition
    ? db.select().from(events).where(condition)
    : db.select().from(events);

  return query.orderBy(desc(events.date)).offset(offset).limit(limit);
}

export async function getEventsWithJobs(
  db: Db,
  offset: number,
  limit: number,
  typeFilter?: string,
) {
  const conditions = typeFilter ? [eq(events.type, typeFilter)] : [];
  const baseQuery = db
    .select({
      id: events.id,
      job_id: events.job_id,
      type: events.type,
      title: events.title,
      description: events.description,
      date: events.date,
      reminder_at: events.reminder_at,
      created_at: events.created_at,
      company: jobs.company,
      role: jobs.role,
      job_status: jobs.status,
    })
    .from(events)
    .leftJoin(jobs, eq(events.job_id, jobs.id));

  const query = conditions.length
    ? baseQuery.where(and(...conditions))
    : baseQuery;

  return query.orderBy(desc(events.date)).offset(offset).limit(limit);
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function createContact(
  db: Db,
  data: typeof contacts.$inferInsert,
) {
  return db
    .insert(contacts)
    .values(data)
    .returning()
    .then((r) => r[0]);
}

export async function updateContact(
  db: Db,
  id: string,
  data: Partial<Omit<typeof contacts.$inferInsert, "id" | "created_at">>,
) {
  return db
    .update(contacts)
    .set(data)
    .where(eq(contacts.id, id))
    .returning()
    .then((r) => r[0]);
}

export async function deleteContact(db: Db, id: string) {
  return db.delete(contacts).where(eq(contacts.id, id));
}

export async function getContacts(db: Db) {
  return db.select().from(contacts).orderBy(contacts.name);
}

export async function getContactById(db: Db, id: string) {
  return db.select().from(contacts).where(eq(contacts.id, id)).then((r) => r[0]);
}

// ---------------------------------------------------------------------------
// Job–Contact links
// ---------------------------------------------------------------------------

export async function linkContact(
  db: Db,
  data: typeof jobContacts.$inferInsert,
) {
  return db.insert(jobContacts).values(data).returning().then((r) => r[0]);
}

export async function unlinkContact(
  db: Db,
  jobId: string,
  contactId: string,
) {
  return db
    .delete(jobContacts)
    .where(and(eq(jobContacts.job_id, jobId), eq(jobContacts.contact_id, contactId)));
}

export async function getContactsForJob(db: Db, jobId: string) {
  const links = await db
    .select({ contact_id: jobContacts.contact_id, relationship: jobContacts.relationship })
    .from(jobContacts)
    .where(eq(jobContacts.job_id, jobId));

  if (!links.length) return [];

  const ids = links.map((l) => l.contact_id);
  const contactRows = await db
    .select()
    .from(contacts)
    .where(inArray(contacts.id, ids));

  return contactRows.map((c) => ({
    ...c,
    relationship: links.find((l) => l.contact_id === c.id)?.relationship,
  }));
}

export async function getJobsForContact(db: Db, contactId: string) {
  const links = await db
    .select({ job_id: jobContacts.job_id, relationship: jobContacts.relationship })
    .from(jobContacts)
    .where(eq(jobContacts.contact_id, contactId));

  if (!links.length) return [];

  const ids = links.map((l) => l.job_id);
  const jobRows = await db
    .select()
    .from(jobs)
    .where(inArray(jobs.id, ids));

  return jobRows.map((j) => ({
    ...j,
    relationship: links.find((l) => l.job_id === j.id)?.relationship,
  }));
}

// ---------------------------------------------------------------------------
// Dashboard aggregates
// ---------------------------------------------------------------------------

export async function getJobCountsByStatus(db: Db) {
  const rows = await db
    .select({
      status: jobs.status,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(jobs)
    .groupBy(jobs.status);

  return Object.fromEntries(rows.map((r) => [r.status, r.count]));
}

export async function getUpcomingEvents(db: Db, days = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 86_400_000);
  return db
    .select()
    .from(events)
    .where(
      and(
        lte(events.date, future.toISOString()),
        sql`${events.date} >= ${now.toISOString()}`,
      ),
    )
    .orderBy(events.date);
}

export async function getOverdueFollowUps(db: Db) {
  const now = new Date().toISOString();
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.type, "follow_up"),
        sql`${events.date} < ${now}`,
      ),
    )
    .orderBy(events.date);
}

export async function getStats(db: Db) {
  const [totalRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs);

  const [appliedRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(
      inArray(jobs.status, [
        "applied",
        "interview",
        "offer",
        "accepted",
        "rejected",
        "withdrawn",
        "ghosted",
      ]),
    );

  const [responseRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(
      inArray(jobs.status, ["interview", "offer", "accepted", "rejected"]),
    );

  const total = totalRow.count;
  const applied = appliedRow.count;
  const responded = responseRow.count;
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

  // Active streak: consecutive days with at least one event, ending today
  const recentEvents = await db
    .select({ date: events.date })
    .from(events)
    .orderBy(desc(events.date))
    .limit(100);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = new Set(
    recentEvents.map((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );

  for (let i = 0; i <= 365; i++) {
    const day = new Date(today.getTime() - i * 86_400_000).getTime();
    if (uniqueDays.has(day)) {
      streak++;
    } else {
      break;
    }
  }

  return { total, applied, responseRate, streak };
}
