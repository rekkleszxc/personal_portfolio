SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- SERVICES  "Work With Me" 
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(60) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `short_desc` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `price_range` VARCHAR(80) NULL COMMENT 'e.g. ₱5k - ₱15k / Custom Quote',
  `cta_text` VARCHAR(40) NOT NULL DEFAULT 'Get a Quote',
  `icon_key` VARCHAR(40) NULL COMMENT 'para sa lucide-react icon',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_services_slug` (`slug`),
  KEY `idx_services_active_sort` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PROJECTS / CASE STUDIES 
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `client_name` VARCHAR(120) NULL,
  `role` VARCHAR(80) NULL COMMENT 'e.g. Frontend Developer, Fullstack',
  `category` VARCHAR(60) NULL COMMENT 'e.g. Web App, Landing Page, API',
  `cover_image` VARCHAR(500) NULL,
  `thumbnail` VARCHAR(500) NULL,
  `short_desc` VARCHAR(280) NOT NULL,
  `overview` MEDIUMTEXT NULL,
  `problem` MEDIUMTEXT NULL,
  `solution` MEDIUMTEXT NULL,
  `results` MEDIUMTEXT NULL COMMENT 'Besta gamitin mo dito yung numbers (e.g. +65% conversion)',
  `tech_stack` JSON NULL COMMENT '["Next.js","TypeScript","TailwindCSS"]',
  `live_url` VARCHAR(500) NULL,
  `repo_url` VARCHAR(500) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `cta_clicks` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_projects_slug` (`slug`),
  KEY `idx_projects_published_featured` (`is_published`, `is_featured`, `sort_order`),
  KEY `idx_projects_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TESTIMONIALS 
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `role` VARCHAR(120) NULL COMMENT 'e.g. CEO @ Company / Client',
  `company` VARCHAR(120) NULL,
  `avatar_url` VARCHAR(500) NULL,
  `rating` TINYINT UNSIGNED NULL CHECK (`rating` BETWEEN 1 AND 5),
  `quote` TEXT NOT NULL,
  `project_id` INT UNSIGNED NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_testimonials_published` (`is_published`, `is_featured`, `sort_order`),
  CONSTRAINT `fk_testimonials_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ENHANCE LEADS 
ALTER TABLE `leads`
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(40) NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `company` VARCHAR(120) NULL AFTER `phone`,
  ADD COLUMN IF NOT EXISTS `service_id` INT UNSIGNED NULL AFTER `company`,
  ADD COLUMN IF NOT EXISTS `project_id` INT UNSIGNED NULL AFTER `service_id`,
  ADD COLUMN IF NOT EXISTS `budget_range` VARCHAR(60) NULL AFTER `project_id` COMMENT 'e.g. <₱5k, ₱5k-₱10k, ₱10k-₱20k, >₱20k',
  ADD COLUMN IF NOT EXISTS `timeline` VARCHAR(60) NULL AFTER `budget_range` COMMENT 'e.g. ASAP, 1-2 weeks, Flexible',
  ADD COLUMN IF NOT EXISTS `goal` VARCHAR(160) NULL AFTER `timeline` COMMENT 'e.g. Build landing page, Redesign site',
  ADD COLUMN IF NOT EXISTS `lead_score` TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER `goal` COMMENT '0-100 for quick prioritization',
  ADD COLUMN IF NOT EXISTS `tags` JSON NULL AFTER `lead_score` COMMENT '["urgent","referral"]',
  ADD COLUMN IF NOT EXISTS `last_contacted_at` TIMESTAMP NULL AFTER `converted_at`;

-- Foreign keys para sa lead context 
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leads_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

-- CONVERSION EVENTS 
CREATE TABLE IF NOT EXISTS `conversion_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` ENUM('page_view','project_view','cta_click','service_click','contact_open','form_submit','form_success','outbound_click') NOT NULL,
  `path` VARCHAR(500) NULL,
  `project_id` INT UNSIGNED NULL,
  `service_id` INT UNSIGNED NULL,
  `lead_id` BIGINT UNSIGNED NULL,
  `session_id` CHAR(36) NULL COMMENT 'uuid v4 para group per session',
  `referrer` VARCHAR(500) NULL,
  `utm_source` VARCHAR(120) NULL,
  `utm_medium` VARCHAR(120) NULL,
  `utm_campaign` VARCHAR(120) NULL,
  `utm_term` VARCHAR(120) NULL,
  `utm_content` VARCHAR(120) NULL,
  `user_agent` VARCHAR(500) NULL,
  `ip_hash` CHAR(64) NULL,
  `meta` JSON NULL COMMENT 'extra context e.g. {"button":"hire_me"}',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_type_date` (`event_type`, `created_at`),
  KEY `idx_events_session` (`session_id`),
  KEY `idx_events_project` (`project_id`),
  KEY `idx_events_lead` (`lead_id`),
  CONSTRAINT `fk_events_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_events_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_events_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
