import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { ensureSchema, getPool, isDbConfigured } from "./db";
import { type LeadStatus } from "./lead-status";

export type LeadInput = {
  name: string;
  email: string;
  message: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  page_url?: string;
  user_agent?: string;
  ip_hash?: string;
};

export type Lead = {
  id: number;
  name: string;
  email: string;
  message: string;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  page_url: string | null;
  status: LeadStatus;
  created_at: string;
};

export type LeadStats = {
  total: number;
  newCount: number;
  inProgress: number;
  won: number;
  lost: number;
  last7Days: number;
  conversionRate: number;
};

const LIMITS = {
  name: 120,
  email: 254,
  message: 5000,
  source: 64,
  utm: 120,
  url: 500,
  user_agent: 500,
};

const clean = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

export async function recordLead(input: LeadInput): Promise<number | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const pool = getPool();
  if (!pool) return null;

  const source =
    clean(input.source, LIMITS.source) ??
    clean(input.utm_source, LIMITS.source) ??
    "direct";

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO leads
      (name, email, message, source, utm_source, utm_medium, utm_campaign,
       utm_term, utm_content, referrer, landing_page, page_url, user_agent, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clean(input.name, LIMITS.name) ?? "",
      clean(input.email, LIMITS.email) ?? "",
      clean(input.message, LIMITS.message) ?? "",
      source,
      clean(input.utm_source, LIMITS.utm),
      clean(input.utm_medium, LIMITS.utm),
      clean(input.utm_campaign, LIMITS.utm),
      clean(input.utm_term, LIMITS.utm),
      clean(input.utm_content, LIMITS.utm),
      clean(input.referrer, LIMITS.url),
      clean(input.landing_page, LIMITS.url),
      clean(input.page_url, LIMITS.url),
      clean(input.user_agent, LIMITS.user_agent),
      clean(input.ip_hash, 64),
    ],
  );

  return result.insertId;
}

type LeadRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  message: string;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  page_url: string | null;
  status: LeadStatus;
  created_at: Date | string;
};

const toLead = (row: LeadRow): Lead => ({
  ...row,
  created_at:
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
});

export async function listLeads(limit = 200): Promise<Lead[]> {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const pool = getPool();
  if (!pool) return [];
  const [rows] = await pool.query<LeadRow[]>(
    `SELECT id, name, email, message, source, utm_source, utm_medium,
            utm_campaign, utm_term, utm_content, referrer, landing_page,
            page_url, status, created_at
     FROM leads
     ORDER BY created_at DESC
     LIMIT ?`,
    [Math.max(1, Math.min(limit, 500))],
  );
  return rows.map(toLead);
}

type StatsRow = RowDataPacket & {
  total: number | string;
  newCount: number | string;
  inProgress: number | string;
  won: number | string;
  lost: number | string;
  last7Days: number | string;
};

export async function leadStats(): Promise<LeadStats> {
  const empty: LeadStats = {
    total: 0,
    newCount: 0,
    inProgress: 0,
    won: 0,
    lost: 0,
    last7Days: 0,
    conversionRate: 0,
  };
  if (!isDbConfigured()) return empty;
  await ensureSchema();
  const pool = getPool();
  if (!pool) return empty;

  const [rows] = await pool.query<StatsRow[]>(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(status = 'new'), 0) AS newCount,
       COALESCE(SUM(status IN ('contacted', 'qualified')), 0) AS inProgress,
       COALESCE(SUM(status = 'won'), 0) AS won,
       COALESCE(SUM(status = 'lost'), 0) AS lost,
       COALESCE(SUM(created_at >= NOW() - INTERVAL 7 DAY), 0) AS last7Days
     FROM leads`,
  );

  const row = rows[0];
  const number = (value: number | string | undefined) => Number(value ?? 0);
  const total = number(row?.total);
  const won = number(row?.won);
  return {
    total,
    newCount: number(row?.newCount),
    inProgress: number(row?.inProgress),
    won,
    lost: number(row?.lost),
    last7Days: number(row?.last7Days),
    conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
  };
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  await ensureSchema();
  const pool = getPool();
  if (!pool) throw new Error("Database is not configured.");
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE leads
     SET status = ?,
         converted_at = CASE WHEN ? = 'won' THEN COALESCE(converted_at, NOW()) ELSE NULL END
     WHERE id = ?`,
    [status, status, id],
  );
  return result.affectedRows > 0;
}
