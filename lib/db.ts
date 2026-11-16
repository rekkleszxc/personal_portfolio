import mysql from "mysql2/promise";
import type { LeadStatus } from "./lead-status";

const globalForDb = globalThis as unknown as {
  __portfolioPool?: mysql.Pool;
  __portfolioSchema?: Promise<void>;
};

export type { LeadStatus };

export function isDbConfigured() {
  return Boolean(
    process.env.DATABASE_URL ||
      (process.env.MYSQL_HOST &&
        process.env.MYSQL_USER &&
        process.env.MYSQL_DATABASE),
  );
}

export function getPool(): mysql.Pool | null {
  if (globalForDb.__portfolioPool) return globalForDb.__portfolioPool;
  if (!isDbConfigured()) return null;

  const pool = process.env.DATABASE_URL
    ? mysql.createPool(process.env.DATABASE_URL)
    : mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT ?? 3306),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        enableKeepAlive: true,
      });

  globalForDb.__portfolioPool = pool;
  return pool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'direct',
  utm_source VARCHAR(120) NULL,
  utm_medium VARCHAR(120) NULL,
  utm_campaign VARCHAR(120) NULL,
  utm_term VARCHAR(120) NULL,
  utm_content VARCHAR(120) NULL,
  referrer VARCHAR(500) NULL,
  landing_page VARCHAR(500) NULL,
  page_url VARCHAR(500) NULL,
  user_agent VARCHAR(500) NULL,
  ip_hash CHAR(64) NULL,
  status ENUM('new','contacted','qualified','won','lost') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  converted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_leads_created_at (created_at),
  KEY idx_leads_status (status),
  KEY idx_leads_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

export async function ensureSchema() {
  const pool = getPool();
  if (!pool) throw new Error("Database is not configured.");
  if (!globalForDb.__portfolioSchema) {
    globalForDb.__portfolioSchema = pool
      .query(SCHEMA)
      .then(() => undefined)
      .catch((err) => {
        globalForDb.__portfolioSchema = undefined;
        throw err;
      });
  }
  await globalForDb.__portfolioSchema;
}
