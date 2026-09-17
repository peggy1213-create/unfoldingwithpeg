import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: text("status", {
    enum: [
      "saved",
      "applied",
      "interview",
      "offer",
      "accepted",
      "rejected",
      "withdrawn",
      "ghosted",
      "archived",
    ],
  })
    .notNull()
    .default("saved"),
  salary: text("salary"),
  location: text("location"),
  source: text("source"),
  url: text("url"),
  notes: text("notes"),
  tags: text("tags").default("[]"),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  job_id: text("job_id")
    .notNull()
    .references(() => jobs.id),
  type: text("type", {
    enum: [
      "applied",
      "phone_screen",
      "interview",
      "take_home",
      "offer",
      "follow_up",
      "rejection",
      "status_change",
      "note",
      "other",
    ],
  }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  reminder_at: text("reminder_at"),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  title: text("title"),
  email: text("email"),
  phone: text("phone"),
  linkedin_url: text("linkedin_url"),
  notes: text("notes"),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const jobContacts = sqliteTable(
  "job_contacts",
  {
    job_id: text("job_id")
      .notNull()
      .references(() => jobs.id),
    contact_id: text("contact_id")
      .notNull()
      .references(() => contacts.id),
    relationship: text("relationship"),
  },
  (table) => [primaryKey({ columns: [table.job_id, table.contact_id] })],
);
