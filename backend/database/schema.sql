-- =====================================================================
-- LIBRA - Intelligent Library Management System
-- Database Schema Definition (MySQL 8)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `libra_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `libra_db`;

-- Drop tables in reverse dependency order if reconstructing
-- (Safe: only executed when explicitly rebuilding)
-- DROP TABLE IF EXISTS `loans`;
-- DROP TABLE IF EXISTS `members`;
-- DROP TABLE IF EXISTS `books`;

-- =====================================================================
-- 1. BOOKS TABLE
-- Stores catalog details, ISBN indexes, and physical shelf inventory counts
-- =====================================================================
CREATE TABLE IF NOT EXISTS `books` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `isbn` VARCHAR(30) NOT NULL UNIQUE,
    `category` VARCHAR(100) NOT NULL,
    `total_copies` INT NOT NULL,
    `available_copies` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_total_copies_positive` CHECK (`total_copies` > 0),
    CONSTRAINT `chk_available_not_exceed_total` CHECK (`available_copies` >= 0 AND `available_copies` <= `total_copies`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. MEMBERS TABLE
-- Stores registered patrons, contact details, and join date
-- =====================================================================
CREATE TABLE IF NOT EXISTS `members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NULL,
    `registration_date` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 3. LOANS TABLE
-- Circulation transactions tracking book issues, due dates, returns, and fines
-- =====================================================================
CREATE TABLE IF NOT EXISTS `loans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `book_id` INT NOT NULL,
    `member_id` INT NOT NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `return_date` DATE NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
    `fine_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT `fk_loans_book` FOREIGN KEY (`book_id`) 
        REFERENCES `books` (`id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_loans_member` FOREIGN KEY (`member_id`) 
        REFERENCES `members` (`id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT `chk_due_after_issue` CHECK (`due_date` >= `issue_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for fast searching, filtering, and reporting queries
CREATE INDEX `idx_books_category` ON `books` (`category`);
CREATE INDEX `idx_books_title` ON `books` (`title`);
CREATE INDEX `idx_members_name` ON `members` (`name`);
CREATE INDEX `idx_loans_status` ON `loans` (`status`);
CREATE INDEX `idx_loans_due_date` ON `loans` (`due_date`);
CREATE INDEX `idx_loans_issue_date` ON `loans` (`issue_date`);

