import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (env[key] === undefined) env[key] = value;
    }
  }
  return env;
}

const env = loadEnv();

function connectionOptions() {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (env.MYSQL_HOST && env.MYSQL_USER && env.MYSQL_DATABASE) {
    return {
      host: env.MYSQL_HOST,
      port: Number(env.MYSQL_PORT ?? 3306),
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
    };
  }
  throw new Error(
    "Database is not configured. Set DATABASE_URL or MYSQL_HOST/MYSQL_USER/MYSQL_DATABASE in .env.local",
  );
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS \`services\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`slug\` VARCHAR(60) NOT NULL,
  \`title\` VARCHAR(120) NOT NULL,
  \`short_desc\` VARCHAR(255) NULL,
  \`description\` TEXT NULL,
  \`price_range\` VARCHAR(80) NULL,
  \`cta_text\` VARCHAR(40) NOT NULL DEFAULT 'Get a Quote',
  \`icon_key\` VARCHAR(40) NULL,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_services_slug\` (\`slug\`),
  KEY \`idx_services_active_sort\` (\`is_active\`, \`sort_order\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`projects\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`slug\` VARCHAR(160) NOT NULL,
  \`title\` VARCHAR(160) NOT NULL,
  \`client_name\` VARCHAR(120) NULL,
  \`role\` VARCHAR(80) NULL,
  \`category\` VARCHAR(60) NULL,
  \`cover_image\` VARCHAR(500) NULL,
  \`thumbnail\` VARCHAR(500) NULL,
  \`short_desc\` VARCHAR(280) NOT NULL,
  \`overview\` MEDIUMTEXT NULL,
  \`problem\` MEDIUMTEXT NULL,
  \`solution\` MEDIUMTEXT NULL,
  \`results\` MEDIUMTEXT NULL,
  \`tech_stack\` JSON NULL,
  \`live_url\` VARCHAR(500) NULL,
  \`repo_url\` VARCHAR(500) NULL,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
  \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`views\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`cta_clicks\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`published_at\` DATE NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_projects_slug\` (\`slug\`),
  KEY \`idx_projects_published_featured\` (\`is_published\`, \`is_featured\`, \`sort_order\`),
  KEY \`idx_projects_category\` (\`category\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`testimonials\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(120) NOT NULL,
  \`role\` VARCHAR(120) NULL,
  \`company\` VARCHAR(120) NULL,
  \`avatar_url\` VARCHAR(500) NULL,
  \`rating\` TINYINT UNSIGNED NULL CHECK (\`rating\` BETWEEN 1 AND 5),
  \`quote\` TEXT NOT NULL,
  \`project_id\` INT UNSIGNED NULL,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
  \`sort_order\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_testimonials_published\` (\`is_published\`, \`is_featured\`, \`sort_order\`),
  CONSTRAINT \`fk_testimonials_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`conversion_events\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`event_type\` ENUM('page_view','project_view','cta_click','service_click','contact_open','form_submit','form_success','outbound_click') NOT NULL,
  \`path\` VARCHAR(500) NULL,
  \`project_id\` INT UNSIGNED NULL,
  \`service_id\` INT UNSIGNED NULL,
  \`lead_id\` BIGINT UNSIGNED NULL,
  \`session_id\` CHAR(36) NULL,
  \`referrer\` VARCHAR(500) NULL,
  \`utm_source\` VARCHAR(120) NULL,
  \`utm_medium\` VARCHAR(120) NULL,
  \`utm_campaign\` VARCHAR(120) NULL,
  \`utm_term\` VARCHAR(120) NULL,
  \`utm_content\` VARCHAR(120) NULL,
  \`user_agent\` VARCHAR(500) NULL,
  \`ip_hash\` CHAR(64) NULL,
  \`meta\` JSON NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_events_type_date\` (\`event_type\`, \`created_at\`),
  KEY \`idx_events_session\` (\`session_id\`),
  KEY \`idx_events_project\` (\`project_id\`),
  KEY \`idx_events_lead\` (\`lead_id\`),
  CONSTRAINT \`fk_events_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_events_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_events_lead\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const LEAD_COLUMNS = [
  ["phone", "ALTER TABLE `leads` ADD COLUMN `phone` VARCHAR(40) NULL AFTER `email`"],
  ["company", "ALTER TABLE `leads` ADD COLUMN `company` VARCHAR(120) NULL AFTER `phone`"],
  ["service_id", "ALTER TABLE `leads` ADD COLUMN `service_id` INT UNSIGNED NULL AFTER `company`"],
  ["project_id", "ALTER TABLE `leads` ADD COLUMN `project_id` INT UNSIGNED NULL AFTER `service_id`"],
  ["budget_range", "ALTER TABLE `leads` ADD COLUMN `budget_range` VARCHAR(60) NULL AFTER `project_id`"],
  ["timeline", "ALTER TABLE `leads` ADD COLUMN `timeline` VARCHAR(60) NULL AFTER `budget_range`"],
  ["goal", "ALTER TABLE `leads` ADD COLUMN `goal` VARCHAR(160) NULL AFTER `timeline`"],
  ["lead_score", "ALTER TABLE `leads` ADD COLUMN `lead_score` TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER `goal`"],
  ["tags", "ALTER TABLE `leads` ADD COLUMN `tags` JSON NULL AFTER `lead_score`"],
  ["last_contacted_at", "ALTER TABLE `leads` ADD COLUMN `last_contacted_at` TIMESTAMP NULL AFTER `converted_at`"],
];

// ---------------------------------------------------------------------------
// TEMPLATE DATA - palitan mo lang ang mga value sa baba.
// ---------------------------------------------------------------------------

const services = [
  {
    slug: "web-app-development",
    title: "Web App Development",
    short_desc: "Custom web apps built with Next.js, TypeScript, and MySQL.",
    description:
      "End-to-end development for dashboards, booking systems, and internal tools. Includes database design, authentication, and deployment.",
    price_range: "₱15,000 - ₱50,000 / Custom Quote",
    cta_text: "Start a Project",
    icon_key: "Code2",
    is_featured: 1,
    sort_order: 1,
  },
  {
    slug: "landing-page-design",
    title: "Landing Page Design",
    short_desc: "Fast, mobile-first pages that turn visitors into leads.",
    description:
      "One-page websites focused on a single goal: get inquiries. Includes responsive layout, contact form, and basic analytics.",
    price_range: "₱5,000 - ₱15,000",
    cta_text: "Get a Quote",
    icon_key: "LayoutTemplate",
    is_featured: 1,
    sort_order: 2,
  },
  {
    slug: "portfolio-website",
    title: "Portfolio Website",
    short_desc: "A clean personal site for students and freelancers.",
    description:
      "Show your projects, certificates, and contact details in one place. Easy to update and quick to load.",
    price_range: "₱3,000 - ₱10,000",
    cta_text: "Build My Portfolio",
    icon_key: "UserRound",
    is_featured: 0,
    sort_order: 3,
  },
  {
    slug: "database-setup",
    title: "Database Setup & Integration",
    short_desc: "MySQL schema design, seed data, and admin dashboards.",
    description:
      "Structure your data properly, add safe migrations, and connect it to your app with a simple admin view.",
    price_range: "₱5,000 - ₱20,000",
    cta_text: "Plan My Database",
    icon_key: "Database",
    is_featured: 0,
    sort_order: 4,
  },
  {
    slug: "website-maintenance",
    title: "Website Maintenance & Fixes",
    short_desc: "Bug fixes, speed improvements, and small updates.",
    description:
      "Already have a site? I can fix layout issues, improve performance, and handle small feature requests.",
    price_range: "₱1,000 / hour or Retainer",
    cta_text: "Request a Fix",
    icon_key: "Wrench",
    is_featured: 0,
    sort_order: 5,
  },
];

const projects = [
  {
    slug: "ledgerly",
    title: "Ledgerly",
    client_name: "Template Client",
    role: "Full-Stack Developer",
    category: "Web App",
    cover_image: null,
    thumbnail: null,
    short_desc:
      "Invoicing and payment tracking for freelancers, with Stripe webhooks and a monthly cash-flow view.",
    overview:
      "A small SaaS for freelancers who need to send invoices and see how much money is actually coming in.",
    problem:
      "Freelancers were tracking invoices in spreadsheets and losing track of late payments.",
    solution:
      "Built an invoicing dashboard with automated payment reminders and a monthly cash-flow chart.",
    results: "1.2k active users and 38% fewer late payments.",
    tech_stack: ["Next.js", "Postgres", "Stripe"],
    live_url: "https://example.com",
    repo_url: "https://github.com/example/ledgerly",
    is_featured: 1,
    sort_order: 1,
    views: 420,
    cta_clicks: 31,
    published_at: "2026-01-15",
  },
  {
    slug: "fieldnotes",
    title: "Fieldnotes",
    client_name: "Template Client",
    role: "AI Engineer",
    category: "AI & ML",
    cover_image: null,
    thumbnail: null,
    short_desc:
      "Search over interview transcripts. Retrieval plus a small reranker keeps answers tied to the source quote.",
    overview:
      "A research tool for teams that need to search long interview transcripts without losing context.",
    problem:
      "Manual transcript review was slow and answers could not be traced back to a source.",
    solution:
      "Implemented vector search with citations and a confidence score for every answer.",
    results: "91% answer accuracy with median latency under 2 seconds.",
    tech_stack: ["Python", "pgvector", "FastAPI"],
    live_url: "https://example.com",
    repo_url: "https://github.com/example/fieldnotes",
    is_featured: 1,
    sort_order: 2,
    views: 310,
    cta_clicks: 22,
    published_at: "2026-02-20",
  },
  {
    slug: "orbit-ui",
    title: "Orbit UI",
    client_name: "Template Client",
    role: "Frontend Developer",
    category: "Frontend",
    cover_image: null,
    thumbnail: null,
    short_desc:
      "An accessible React component library with keyboard-first menus and tokens for light and dark themes.",
    overview:
      "A shared design system used across multiple product teams.",
    problem:
      "Each team rebuilt the same buttons, menus, and form controls with inconsistent behavior.",
    solution:
      "Created accessible, themeable components with Storybook documentation.",
    results: "40 components shipped and a perfect accessibility audit score.",
    tech_stack: ["React", "TypeScript", "Storybook"],
    live_url: "https://example.com",
    repo_url: "https://github.com/example/orbit-ui",
    is_featured: 0,
    sort_order: 3,
    views: 205,
    cta_clicks: 12,
    published_at: "2026-03-10",
  },
  {
    slug: "shiplog",
    title: "Shiplog",
    client_name: "Template Client",
    role: "Full-Stack Developer",
    category: "Web App",
    cover_image: null,
    thumbnail: null,
    short_desc:
      "Changelog and release-notes tool that builds a public page from merged pull requests.",
    overview:
      "A release-notes generator for small product teams.",
    problem:
      "Writing changelogs manually was slow and often skipped.",
    solution:
      "Connected to GitHub so merged pull requests automatically become draft release notes.",
    results: "300+ teams use it and setup takes about 4 minutes.",
    tech_stack: ["Next.js", "tRPC", "Prisma"],
    live_url: "https://example.com",
    repo_url: "https://github.com/example/shiplog",
    is_featured: 0,
    sort_order: 4,
    views: 180,
    cta_clicks: 9,
    published_at: "2026-04-05",
  },
  {
    slug: "triage",
    title: "Triage",
    client_name: "Template Client",
    role: "AI Engineer",
    category: "AI & ML",
    cover_image: null,
    thumbnail: null,
    short_desc:
      "Classifies support tickets by urgency and routes them, with a review queue for low-confidence cases.",
    overview:
      "A support automation tool that keeps humans in the loop.",
    problem:
      "Support tickets were routed manually, which delayed urgent requests.",
    solution:
      "Trained a classifier and added a review queue for uncertain predictions.",
    results: "52% faster first response and 94% routing accuracy.",
    tech_stack: ["Python", "scikit-learn", "Redis"],
    live_url: "https://example.com",
    repo_url: "https://github.com/example/triage",
    is_featured: 0,
    sort_order: 5,
    views: 150,
    cta_clicks: 7,
    published_at: "2026-05-12",
  },
  {
    slug: "atlas-dashboard",
    title: "Atlas Dashboard",
    client_name: "Template Client",
    role: "Frontend Developer",
    category: "Frontend",
    cover_image: null,
    thumbnail: null,
    short_desc:
      "A fast analytics dashboard that renders 100k rows with virtualized tables and streaming charts.",
    overview:
      "A data-heavy dashboard for operations teams.",
    problem:
      "The old dashboard froze when loading large tables.",
    solution:
      "Added virtualized tables, streaming charts, and route-level code splitting.",
    results: "Smooth 60fps scrolling and 70% smaller bundle size.",
    tech_stack: ["React", "D3", "Vite"],
    live_url: "https://example.com",
    repo_url: "https://github.com/example/atlas",
    is_featured: 0,
    sort_order: 6,
    views: 120,
    cta_clicks: 5,
    published_at: "2026-06-01",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Maria Santos",
    role: "Founder",
    company: "Template Studio",
    avatar_url: null,
    rating: 5,
    quote:
      "George delivered the project ahead of schedule and explained every decision in plain language.",
    project_slug: "ledgerly",
    is_featured: 1,
    sort_order: 1,
  },
  {
    id: 2,
    name: "John Dela Cruz",
    role: "Product Manager",
    company: "Sample Labs",
    avatar_url: null,
    rating: 5,
    quote:
      "The new landing page doubled our inquiries in the first month. Clear communication all the way.",
    project_slug: "shiplog",
    is_featured: 1,
    sort_order: 2,
  },
  {
    id: 3,
    name: "Ana Reyes",
    role: "Student",
    company: "Quezon City University",
    avatar_url: null,
    rating: 4,
    quote:
      "He helped me set up my portfolio and database for our capstone project. Very patient and easy to work with.",
    project_slug: "orbit-ui",
    is_featured: 0,
    sort_order: 3,
  },
  {
    id: 4,
    name: "Mark Villanueva",
    role: "Small Business Owner",
    company: "Template Cafe",
    avatar_url: null,
    rating: 5,
    quote:
      "Our booking page finally works on mobile. Simple, fast, and exactly what we needed.",
    project_slug: "atlas-dashboard",
    is_featured: 0,
    sort_order: 4,
  },
];

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const leads = [
  {
    name: "Maria Santos",
    email: "maria.santos@example.com",
    phone: "+63 917 000 0001",
    company: "Template Studio",
    message:
      "Hi! We need a landing page for our new product. Can you share your rates and timeline?",
    source: "sample",
    utm_source: "facebook",
    utm_medium: "social",
    utm_campaign: "launch",
    service_slug: "landing-page-design",
    project_slug: null,
    budget_range: "₱5k-₱10k",
    timeline: "2-3 weeks",
    goal: "Build landing page",
    lead_score: 85,
    tags: ["hot", "has-budget"],
    status: "new",
    created_at: daysAgo(1),
  },
  {
    name: "John Dela Cruz",
    email: "john.delacruz@example.com",
    phone: "+63 917 000 0002",
    company: "Sample Labs",
    message:
      "We saw your portfolio and would like help fixing our dashboard performance.",
    source: "sample",
    utm_source: "linkedin",
    utm_medium: "social",
    utm_campaign: "outreach",
    service_slug: "website-maintenance",
    project_slug: "atlas-dashboard",
    budget_range: "₱10k-₱20k",
    timeline: "1-2 weeks",
    goal: "Improve site performance",
    lead_score: 70,
    tags: ["referral"],
    status: "contacted",
    created_at: daysAgo(3),
    last_contacted_at: daysAgo(1),
  },
  {
    name: "Ana Reyes",
    email: "ana.reyes@example.com",
    phone: null,
    company: "Quezon City University",
    message:
      "Good day! Can you help us set up a database for our capstone project?",
    source: "sample",
    utm_source: "google",
    utm_medium: "organic",
    utm_campaign: null,
    service_slug: "database-setup",
    project_slug: null,
    budget_range: "<₱5k",
    timeline: "Flexible",
    goal: "Set up database",
    lead_score: 45,
    tags: ["student", "low-budget"],
    status: "qualified",
    created_at: daysAgo(5),
    last_contacted_at: daysAgo(2),
  },
  {
    name: "Mark Villanueva",
    email: "mark.villanueva@example.com",
    phone: "+63 917 000 0003",
    company: "Template Cafe",
    message:
      "We need a simple booking page and we liked your previous work. How much would it cost?",
    source: "sample",
    utm_source: "referral",
    utm_medium: "word-of-mouth",
    utm_campaign: null,
    service_slug: "web-app-development",
    project_slug: "ledgerly",
    budget_range: "₱15k+",
    timeline: "ASAP",
    goal: "Build booking page",
    lead_score: 95,
    tags: ["hot", "ready-to-pay"],
    status: "won",
    created_at: daysAgo(10),
    last_contacted_at: daysAgo(4),
    converted_at: daysAgo(2),
  },
  {
    name: "Carlo Mendoza",
    email: "carlo.mendoza@example.com",
    phone: null,
    company: null,
    message: "How much for a portfolio website? Just asking for now.",
    source: "sample",
    utm_source: "instagram",
    utm_medium: "social",
    utm_campaign: "bio-link",
    service_slug: "portfolio-website",
    project_slug: null,
    budget_range: "<₱5k",
    timeline: "Flexible",
    goal: "Build portfolio",
    lead_score: 25,
    tags: ["browsing"],
    status: "lost",
    created_at: daysAgo(14),
  },
  {
    name: "Liza Fernandez",
    email: "liza.fernandez@example.com",
    phone: "+63 917 000 0004",
    company: "Fernandez Enterprises",
    message:
      "We want to automate our inventory tracking with a small internal web app.",
    source: "sample",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "web-app",
    service_slug: "web-app-development",
    project_slug: null,
    budget_range: "₱20k+",
    timeline: "1-2 months",
    goal: "Build internal tool",
    lead_score: 80,
    tags: ["business", "has-budget"],
    status: "new",
    created_at: daysAgo(0),
  },
];

// ---------------------------------------------------------------------------

const target = connectionOptions();
const pool =
  typeof target === "string"
    ? mysql.createPool(target)
    : mysql.createPool({ ...target, waitForConnections: true, connectionLimit: 5 });

async function main() {
  const conn = await pool.getConnection();
  try {
    const [[dbRow]] = await conn.query("SELECT DATABASE() AS db");
    const dbName = dbRow.db;

    for (const statement of SCHEMA_SQL.split(";")
      .map((s) => s.trim())
      .filter(Boolean)) {
      await conn.query(statement);
    }

    const [leadCols] = await conn.query("SHOW COLUMNS FROM `leads`");
    const existingCols = new Set(leadCols.map((c) => c.Field));
    for (const [column, sql] of LEAD_COLUMNS) {
      if (!existingCols.has(column)) await conn.query(sql);
    }

    const [fkRows] = await conn.query(
      `SELECT CONSTRAINT_NAME AS name
       FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'leads' AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      [dbName],
    );
    const existingFks = new Set(fkRows.map((r) => r.name));
    if (!existingFks.has("fk_leads_service")) {
      await conn.query(
        "ALTER TABLE `leads` ADD CONSTRAINT `fk_leads_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL",
      );
    }
    if (!existingFks.has("fk_leads_project")) {
      await conn.query(
        "ALTER TABLE `leads` ADD CONSTRAINT `fk_leads_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL",
      );
    }

    for (const s of services) {
      await conn.execute(
        `INSERT INTO services
          (slug, title, short_desc, description, price_range, cta_text, icon_key, is_featured, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE
          title = VALUES(title), short_desc = VALUES(short_desc), description = VALUES(description),
          price_range = VALUES(price_range), cta_text = VALUES(cta_text), icon_key = VALUES(icon_key),
          is_featured = VALUES(is_featured), is_active = VALUES(is_active), sort_order = VALUES(sort_order)`,
        [
          s.slug,
          s.title,
          s.short_desc,
          s.description,
          s.price_range,
          s.cta_text,
          s.icon_key,
          s.is_featured,
          s.sort_order,
        ],
      );
    }

    for (const p of projects) {
      await conn.execute(
        `INSERT INTO projects
          (slug, title, client_name, role, category, cover_image, thumbnail, short_desc,
           overview, problem, solution, results, tech_stack, live_url, repo_url,
           is_featured, is_published, sort_order, views, cta_clicks, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          title = VALUES(title), client_name = VALUES(client_name), role = VALUES(role),
          category = VALUES(category), cover_image = VALUES(cover_image), thumbnail = VALUES(thumbnail),
          short_desc = VALUES(short_desc), overview = VALUES(overview), problem = VALUES(problem),
          solution = VALUES(solution), results = VALUES(results), tech_stack = VALUES(tech_stack),
          live_url = VALUES(live_url), repo_url = VALUES(repo_url), is_featured = VALUES(is_featured),
          is_published = VALUES(is_published), sort_order = VALUES(sort_order),
          views = VALUES(views), cta_clicks = VALUES(cta_clicks), published_at = VALUES(published_at)`,
        [
          p.slug,
          p.title,
          p.client_name,
          p.role,
          p.category,
          p.cover_image,
          p.thumbnail,
          p.short_desc,
          p.overview,
          p.problem,
          p.solution,
          p.results,
          JSON.stringify(p.tech_stack),
          p.live_url,
          p.repo_url,
          p.is_featured,
          p.sort_order,
          p.views,
          p.cta_clicks,
          p.published_at,
        ],
      );
    }

    const [projectRows] = await conn.query("SELECT id, slug FROM projects");
    const [serviceRows] = await conn.query("SELECT id, slug FROM services");
    const projectIds = new Map(projectRows.map((r) => [r.slug, r.id]));
    const serviceIds = new Map(serviceRows.map((r) => [r.slug, r.id]));

    for (const t of testimonials) {
      await conn.execute(
        `INSERT INTO testimonials
          (id, name, role, company, avatar_url, rating, quote, project_id, is_featured, is_published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE
          name = VALUES(name), role = VALUES(role), company = VALUES(company),
          avatar_url = VALUES(avatar_url), rating = VALUES(rating), quote = VALUES(quote),
          project_id = VALUES(project_id), is_featured = VALUES(is_featured),
          is_published = VALUES(is_published), sort_order = VALUES(sort_order)`,
        [
          t.id,
          t.name,
          t.role,
          t.company,
          t.avatar_url,
          t.rating,
          t.quote,
          projectIds.get(t.project_slug) ?? null,
          t.is_featured,
          t.sort_order,
        ],
      );
    }

    await conn.query("DELETE FROM conversion_events WHERE session_id LIKE 'sample-%'");
    await conn.query("DELETE FROM leads WHERE source = 'sample'");

    const leadIds = [];
    for (const l of leads) {
      const [result] = await conn.execute(
        `INSERT INTO leads
          (name, email, phone, company, message, source, utm_source, utm_medium, utm_campaign,
           service_id, project_id, budget_range, timeline, goal, lead_score, tags, status,
           created_at, updated_at, converted_at, last_contacted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          l.name,
          l.email,
          l.phone,
          l.company,
          l.message,
          l.source,
          l.utm_source,
          l.utm_medium,
          l.utm_campaign,
          serviceIds.get(l.service_slug) ?? null,
          projectIds.get(l.project_slug) ?? null,
          l.budget_range,
          l.timeline,
          l.goal,
          l.lead_score,
          JSON.stringify(l.tags),
          l.status,
          l.created_at,
          l.created_at,
          l.converted_at ?? null,
          l.last_contacted_at ?? null,
        ],
      );
      leadIds.push(result.insertId);
    }

    const eventSessions = [
      { session: "sample-session-1", utm_source: "facebook", utm_medium: "social" },
      { session: "sample-session-2", utm_source: "google", utm_medium: "organic" },
      { session: "sample-session-3", utm_source: "referral", utm_medium: "word-of-mouth" },
    ];
    const eventTemplate = [
      { event_type: "page_view", path: "/", meta: null },
      { event_type: "project_view", path: "/#projects", project_slug: "ledgerly", meta: { source: "grid" } },
      { event_type: "cta_click", path: "/", meta: { button: "hire_me" } },
      { event_type: "contact_open", path: "/#contact", meta: null },
      { event_type: "form_submit", path: "/api/contact", meta: null },
      { event_type: "form_success", path: "/api/contact", meta: null },
    ];
    for (const [si, session] of eventSessions.entries()) {
      for (const [ei, ev] of eventTemplate.entries()) {
        await conn.execute(
          `INSERT INTO conversion_events
            (event_type, path, project_id, service_id, lead_id, session_id, utm_source, utm_medium, meta, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ev.event_type,
            ev.path,
            ev.project_slug ? projectIds.get(ev.project_slug) ?? null : null,
            null,
            si < leadIds.length ? leadIds[si] : null,
            session.session,
            session.utm_source,
            session.utm_medium,
            ev.meta ? JSON.stringify(ev.meta) : null,
            daysAgo(si + ei / 10),
          ],
        );
      }
    }

    const [[counts]] = await conn.query(
      `SELECT
        (SELECT COUNT(*) FROM services) AS services,
        (SELECT COUNT(*) FROM projects) AS projects,
        (SELECT COUNT(*) FROM testimonials) AS testimonials,
        (SELECT COUNT(*) FROM leads) AS leads,
        (SELECT COUNT(*) FROM conversion_events) AS events`,
    );
    console.log("Seed complete:", counts);
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exitCode = 1;
});
