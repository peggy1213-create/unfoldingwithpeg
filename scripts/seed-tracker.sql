-- Seed data for job-tracker-db
-- Run with: npx wrangler d1 execute job-tracker-db --file=scripts/seed-tracker.sql

-- Jobs
INSERT INTO jobs (id, company, role, status, salary, location, source, url, notes, tags, created_at, updated_at) VALUES
  ('j1a00000-0000-0000-0000-000000000001', 'Notion', 'Customer Success Manager', 'applied', 'USD 90k–120k', 'Remote (US/TW)', 'LinkedIn', 'https://notion.so/careers', 'Strong alignment with my product background. Applied via referral.', '["cs","remote","referral"]', '2026-09-01T08:00:00.000Z', '2026-09-10T10:00:00.000Z'),
  ('j1a00000-0000-0000-0000-000000000002', 'Canva', 'Learning Experience Designer', 'interview', 'AUD 100k–130k', 'Sydney (hybrid)', 'Canva careers', 'https://canva.com/careers', 'Passed phone screen, onsite scheduled.', '["lxd","hybrid"]', '2026-08-20T06:00:00.000Z', '2026-09-12T09:00:00.000Z'),
  ('j1a00000-0000-0000-0000-000000000003', 'CakeResume', 'Product Manager — Employer Tools', 'saved', 'TWD 1.2M–1.6M', 'Taipei', 'CakeResume', 'https://cakeresume.com/careers', 'Interesting PM role in local edtech-adjacent space.', '["pm","taipei"]', '2026-09-15T04:00:00.000Z', '2026-09-15T04:00:00.000Z'),
  ('j1a00000-0000-0000-0000-000000000004', 'Hahow', 'Community & Partnership Lead', 'applied', 'TWD 1.0M–1.4M', 'Taipei', 'Hahow careers', 'https://hahow.in/careers', 'Love the mission. Submitted application + portfolio.', '["community","taipei","edtech"]', '2026-09-05T03:00:00.000Z', '2026-09-08T07:00:00.000Z'),
  ('j1a00000-0000-0000-0000-000000000005', 'Stripe', 'Technical Support Engineer', 'rejected', 'USD 100k–140k', 'Remote', 'Stripe jobs', 'https://stripe.com/jobs', 'Rejected after final round. Good interview practice.', '["support","remote"]', '2026-07-10T02:00:00.000Z', '2026-08-15T11:00:00.000Z'),
  ('j1a00000-0000-0000-0000-000000000006', 'Duolingo', 'Curriculum Designer — Mandarin', 'offer', 'USD 95k–125k', 'Pittsburgh / Remote', 'Duolingo careers', 'https://duolingo.com/careers', 'Offer received! Reviewing compensation package.', '["lxd","remote","offer"]', '2026-08-01T05:00:00.000Z', '2026-09-16T08:00:00.000Z');

-- Contacts
INSERT INTO contacts (id, name, company, title, email, linkedin_url, notes, created_at) VALUES
  ('c1a00000-0000-0000-0000-000000000001', 'Jamie Lin', 'Notion', 'Senior CSM', 'jamie@example.com', 'https://linkedin.com/in/jamielin', 'Met at SaaStr — offered to refer me.', '2026-08-15T07:00:00.000Z'),
  ('c1a00000-0000-0000-0000-000000000002', 'Wei-Ting Chen', 'Hahow', 'Head of Partnerships', NULL, 'https://linkedin.com/in/weitingchen', 'Connected after Hahow meetup in Taipei.', '2026-09-02T06:00:00.000Z'),
  ('c1a00000-0000-0000-0000-000000000003', 'Priya Sharma', 'Canva', 'L&D Manager', 'priya@example.com', 'https://linkedin.com/in/priyasharma', 'Interviewer for the LXD role.', '2026-08-25T04:00:00.000Z');

-- Events
INSERT INTO events (id, job_id, type, title, description, date, reminder_at, created_at) VALUES
  ('e1a00000-0000-0000-0000-000000000001', 'j1a00000-0000-0000-0000-000000000001', 'applied', 'Submitted application', 'Applied via Jamie referral link.', '2026-09-01T08:00:00.000Z', NULL, '2026-09-01T08:00:00.000Z'),
  ('e1a00000-0000-0000-0000-000000000002', 'j1a00000-0000-0000-0000-000000000001', 'follow_up', 'Follow up with recruiter', NULL, '2026-09-20T08:00:00.000Z', '2026-09-19T08:00:00.000Z', '2026-09-10T10:00:00.000Z'),
  ('e1a00000-0000-0000-0000-000000000003', 'j1a00000-0000-0000-0000-000000000002', 'phone_screen', 'Phone screen with Priya', 'Went well, moving to onsite.', '2026-09-05T02:00:00.000Z', NULL, '2026-09-05T02:00:00.000Z'),
  ('e1a00000-0000-0000-0000-000000000004', 'j1a00000-0000-0000-0000-000000000002', 'interview', 'Onsite interview — portfolio review', 'Prepare case study deck.', '2026-09-22T01:00:00.000Z', '2026-09-21T01:00:00.000Z', '2026-09-12T09:00:00.000Z'),
  ('e1a00000-0000-0000-0000-000000000005', 'j1a00000-0000-0000-0000-000000000004', 'applied', 'Submitted application + portfolio', NULL, '2026-09-05T03:00:00.000Z', NULL, '2026-09-05T03:00:00.000Z'),
  ('e1a00000-0000-0000-0000-000000000006', 'j1a00000-0000-0000-0000-000000000005', 'rejection', 'Rejection after final round', 'Feedback: strong but went with internal candidate.', '2026-08-15T11:00:00.000Z', NULL, '2026-08-15T11:00:00.000Z'),
  ('e1a00000-0000-0000-0000-000000000007', 'j1a00000-0000-0000-0000-000000000006', 'offer', 'Offer received', 'Base 110k + equity. Reviewing benefits.', '2026-09-16T08:00:00.000Z', '2026-09-23T08:00:00.000Z', '2026-09-16T08:00:00.000Z'),
  ('e1a00000-0000-0000-0000-000000000008', 'j1a00000-0000-0000-0000-000000000006', 'interview', 'Final round with hiring manager', 'Great conversation about curriculum philosophy.', '2026-09-10T05:00:00.000Z', NULL, '2026-09-10T05:00:00.000Z');

-- Job–Contact links
INSERT INTO job_contacts (job_id, contact_id, relationship) VALUES
  ('j1a00000-0000-0000-0000-000000000001', 'c1a00000-0000-0000-0000-000000000001', 'referrer'),
  ('j1a00000-0000-0000-0000-000000000002', 'c1a00000-0000-0000-0000-000000000003', 'interviewer'),
  ('j1a00000-0000-0000-0000-000000000004', 'c1a00000-0000-0000-0000-000000000002', 'hiring contact');
