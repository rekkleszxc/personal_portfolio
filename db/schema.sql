-- Portfolio lead database (MySQL 5.7+ / 8+)
-- The app also creates this automatically, but you can run it manually:
--   mysql -u root -p your_database < db/schema.sql

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
