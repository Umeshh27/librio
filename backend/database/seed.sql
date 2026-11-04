-- =====================================================================
-- LIBRA - Intelligent Library Management System
-- Initial Sample Seed Data (MySQL 8) - Indian Context
-- =====================================================================

USE `libra_db`;

-- Clear existing sample records to re-seed with Indian patrons and updated catalog
DELETE FROM `loans`;
DELETE FROM `members`;
DELETE FROM `books`;

ALTER TABLE `books` AUTO_INCREMENT = 1;
ALTER TABLE `members` AUTO_INCREMENT = 1;
ALTER TABLE `loans` AUTO_INCREMENT = 1;

-- 1. SEED BOOKS (12 popular titles)
INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `category`, `total_copies`, `available_copies`, `created_at`) VALUES
(1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Computer Science', 6, 5, '2026-08-01 10:00:00'),
(2, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '978-0201633610', 'Computer Science', 5, 4, '2026-08-05 11:30:00'),
(3, 'The Pragmatic Programmer: Your Journey To Mastery', 'David Thomas, Andrew Hunt', '978-0135957059', 'Computer Science', 4, 4, '2026-08-10 09:15:00'),
(4, 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest', '978-0262033848', 'Mathematics', 8, 8, '2026-08-15 14:00:00'),
(5, 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Computer Science', 7, 6, '2026-08-20 16:45:00'),
(6, 'To Kill a Mockingbird', 'Harper Lee', '978-0060935467', 'Fiction & Literature', 5, 5, '2026-08-25 12:00:00'),
(7, '1984', 'George Orwell', '978-0451524935', 'Fiction & Literature', 6, 6, '2026-09-01 08:30:00'),
(8, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 'Science & Nature', 4, 4, '2026-09-05 13:20:00'),
(9, 'Thinking, Fast and Slow', 'Daniel Kahneman', '978-0374533557', 'Business & Finance', 4, 4, '2026-09-10 15:10:00'),
(10, 'Atomic Habits', 'James Clear', '978-0735211292', 'Business & Finance', 5, 5, '2026-09-15 10:45:00'),
(11, 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Fiction & Literature', 4, 4, '2026-09-20 11:00:00'),
(12, 'A Brief History of Time', 'Stephen Hawking', '978-0553380163', 'Science & Nature', 3, 3, '2026-09-25 17:30:00');

-- 2. SEED MEMBERS (Indian Names and +91 Phone Numbers)
INSERT INTO `members` (`id`, `name`, `email`, `phone`, `registration_date`) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@iitd.ac.in', '+91 98201 44521', '2026-08-15'),
(2, 'Priya Patel', 'priya.patel@iitb.ac.in', '+91 98112 33456', '2026-08-20'),
(3, 'Rohan Verma', 'rohan.verma@bits-pilani.ac.in', '+91 97234 55678', '2026-09-01'),
(4, 'Ananya Iyer', 'ananya.iyer@iisc.ac.in', '+91 94456 77890', '2026-09-12'),
(5, 'Vikram Malhotra', 'vikram.malhotra@iitm.ac.in', '+91 99887 66554', '2026-09-28'),
(6, 'Sneha Reddy', 'sneha.reddy@uohyd.ac.in', '+91 98490 12345', '2026-10-05');

-- 3. SEED LOANS
-- 3 Active Loans (Loan #1 is overdue past Oct 24, 2026 -> ₹55.00 fine)
-- 3 Returned Loans (Loan #5 accrued ₹15.00 fine)
INSERT INTO `loans` (`id`, `book_id`, `member_id`, `issue_date`, `due_date`, `return_date`, `status`, `fine_amount`) VALUES
(1, 1, 1, '2026-10-10', '2026-10-24', NULL, 'ISSUED', 0.00),
(2, 2, 2, '2026-10-28', '2026-11-11', NULL, 'ISSUED', 0.00),
(3, 5, 3, '2026-11-01', '2026-11-15', NULL, 'ISSUED', 0.00),
(4, 3, 4, '2026-09-10', '2026-09-24', '2026-09-22', 'RETURNED', 0.00),
(5, 4, 5, '2026-09-15', '2026-09-29', '2026-10-02', 'RETURNED', 15.00),
(6, 12, 6, '2026-09-20', '2026-10-04', '2026-10-04', 'RETURNED', 0.00);
