package com.libra.dao;

import com.libra.config.DatabaseConnection;
import com.libra.model.Loan;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LoanDAO
 * 
 * Handles all JDBC circulation operations: issuing books, recording returns,
 * calculating fines, and compiling aggregate analytics with JOIN queries.
 */
public class LoanDAO {

    private Loan mapRowToLoan(ResultSet rs) throws SQLException {
        Loan loan = new Loan();
        loan.setId(rs.getInt("id"));
        loan.setBookId(rs.getInt("book_id"));
        loan.setMemberId(rs.getInt("member_id"));

        Date issue = rs.getDate("issue_date");
        loan.setIssueDate(issue != null ? issue.toString() : "");

        Date due = rs.getDate("due_date");
        loan.setDueDate(due != null ? due.toString() : "");

        Date ret = rs.getDate("return_date");
        loan.setReturnDate(ret != null ? ret.toString() : null);

        String status = rs.getString("status");
        loan.setStatus(status);
        loan.setFineAmount(rs.getDouble("fine_amount"));

        // Joined metadata
        loan.setBookTitle(rs.getString("book_title"));
        loan.setBookIsbn(rs.getString("book_isbn"));
        loan.setMemberName(rs.getString("member_name"));
        loan.setMemberEmail(rs.getString("member_email"));
        loan.setMemberPhone(rs.getString("member_phone"));

        // Compute dynamic overdue status for active loans
        if ("ISSUED".equalsIgnoreCase(status) && due != null) {
            LocalDate dueDate = due.toLocalDate();
            LocalDate today = LocalDate.now();
            if (today.isAfter(dueDate)) {
                long days = ChronoUnit.DAYS.between(dueDate, today);
                loan.setDaysOverdue(days);
                loan.setStatus("OVERDUE");
                // dynamic estimated fine at ₹5/day
                loan.setFineAmount(days * 5.0);
            } else {
                loan.setDaysOverdue(0);
            }
        }

        return loan;
    }

    private static final String BASE_JOIN_QUERY =
        "SELECT l.id, l.book_id, l.member_id, l.issue_date, l.due_date, l.return_date, l.status, l.fine_amount, " +
        "       b.title AS book_title, b.isbn AS book_isbn, " +
        "       m.name AS member_name, m.email AS member_email, m.phone AS member_phone " +
        "FROM loans l " +
        "JOIN books b ON l.book_id = b.id " +
        "JOIN members m ON l.member_id = m.id ";

    public List<Loan> getAllLoans() throws SQLException {
        List<Loan> loans = new ArrayList<>();
        String sql = BASE_JOIN_QUERY + "ORDER BY l.id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                loans.add(mapRowToLoan(rs));
            }
        }
        return loans;
    }

    public Loan getLoanById(int id) throws SQLException {
        String sql = BASE_JOIN_QUERY + "WHERE l.id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToLoan(rs);
                }
            }
        }
        return null;
    }

    public List<Loan> getActiveLoans() throws SQLException {
        List<Loan> loans = new ArrayList<>();
        String sql = BASE_JOIN_QUERY + "WHERE l.status = 'ISSUED' ORDER BY l.id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                loans.add(mapRowToLoan(rs));
            }
        }
        return loans;
    }

    public List<Loan> getReturnedLoans() throws SQLException {
        List<Loan> loans = new ArrayList<>();
        String sql = BASE_JOIN_QUERY + "WHERE l.status = 'RETURNED' ORDER BY l.return_date DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                loans.add(mapRowToLoan(rs));
            }
        }
        return loans;
    }

    public List<Loan> getOverdueLoans() throws SQLException {
        List<Loan> loans = new ArrayList<>();
        // Query loans that are currently active and whose due date is before today
        String sql = BASE_JOIN_QUERY + "WHERE l.status = 'ISSUED' AND l.due_date < CURRENT_DATE ORDER BY l.due_date ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                loans.add(mapRowToLoan(rs));
            }
        }
        return loans;
    }

    public List<Loan> getMemberBorrowingHistory(int memberId) throws SQLException {
        List<Loan> loans = new ArrayList<>();
        String sql = BASE_JOIN_QUERY + "WHERE l.member_id = ? ORDER BY l.id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, memberId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    loans.add(mapRowToLoan(rs));
                }
            }
        }
        return loans;
    }

    /**
     * Inserts loan record using an external Connection (as part of a multi-statement transaction).
     */
    public boolean createLoan(Connection conn, Loan loan) throws SQLException {
        String sql = "INSERT INTO loans (book_id, member_id, issue_date, due_date, status, fine_amount) " +
                     "VALUES (?, ?, ?, ?, 'ISSUED', 0.00)";

        try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, loan.getBookId());
            stmt.setInt(2, loan.getMemberId());
            stmt.setDate(3, Date.valueOf(loan.getIssueDate()));
            stmt.setDate(4, Date.valueOf(loan.getDueDate()));

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        loan.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        }
    }

    /**
     * Records book return and sets final calculated fine using an external Connection.
     */
    public boolean returnLoan(Connection conn, int loanId, String returnDate, double fineAmount) throws SQLException {
        String sql = "UPDATE loans SET return_date = ?, status = 'RETURNED', fine_amount = ? WHERE id = ? AND status = 'ISSUED'";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDate(1, Date.valueOf(returnDate));
            stmt.setDouble(2, fineAmount);
            stmt.setInt(3, loanId);

            return stmt.executeUpdate() > 0;
        }
    }

    // ==========================================
    // AGGREGATION & REPORTING QUERIES
    // ==========================================

    public List<Map<String, Object>> getPopularBooks(int limit) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT b.id, b.title, b.author, b.isbn, COUNT(l.id) AS borrow_count " +
                     "FROM books b " +
                     "LEFT JOIN loans l ON b.id = l.book_id " +
                     "GROUP BY b.id, b.title, b.author, b.isbn " +
                     "ORDER BY borrow_count DESC, b.id ASC LIMIT ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, limit);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("bookId", rs.getInt("id"));
                    map.put("title", rs.getString("title"));
                    map.put("author", rs.getString("author"));
                    map.put("isbn", rs.getString("isbn"));
                    map.put("borrows", rs.getInt("borrow_count"));
                    list.add(map);
                }
            }
        }
        return list;
    }

    public List<Map<String, Object>> getMonthlyBorrowingStats() throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT DATE_FORMAT(issue_date, '%b %Y') as month_label, " +
                     "       DATE_FORMAT(issue_date, '%Y-%m') as sort_key, " +
                     "       COUNT(*) as borrow_count " +
                     "FROM loans " +
                     "GROUP BY sort_key, month_label " +
                     "ORDER BY sort_key ASC " +
                     "LIMIT 12";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("month", rs.getString("month_label"));
                map.put("count", rs.getInt("borrow_count"));
                list.add(map);
            }
        }
        return list;
    }

    public List<Map<String, Object>> getCategoryDistribution() throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT category, COUNT(*) as book_count FROM books GROUP BY category ORDER BY book_count DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", rs.getString("category"));
                map.put("count", rs.getInt("book_count"));
                list.add(map);
            }
        }
        return list;
    }

    public Map<String, Object> getDashboardCounts() throws SQLException {
        Map<String, Object> counts = new HashMap<>();
        String sql = 
            "SELECT " +
            "  (SELECT COUNT(*) FROM books) AS total_books, " +
            "  (SELECT COALESCE(SUM(available_copies), 0) FROM books) AS available_copies, " +
            "  (SELECT COUNT(*) FROM loans WHERE status = 'ISSUED') AS issued_books, " +
            "  (SELECT COUNT(*) FROM members) AS total_members, " +
            "  (SELECT COUNT(*) FROM loans WHERE status = 'RETURNED') AS returned_books, " +
            "  (SELECT COUNT(*) FROM loans WHERE status = 'ISSUED' AND due_date < CURRENT_DATE) AS overdue_books, " +
            "  (SELECT COALESCE(SUM(fine_amount), 0) FROM loans) AS total_fines_collected";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                counts.put("totalBooks", rs.getInt("total_books"));
                counts.put("availableBooks", rs.getInt("available_copies"));
                counts.put("issuedBooks", rs.getInt("issued_books"));
                counts.put("totalMembers", rs.getInt("total_members"));
                counts.put("returnedBooks", rs.getInt("returned_books"));
                counts.put("overdueBooks", rs.getInt("overdue_books"));
                counts.put("totalFinesCollected", rs.getDouble("total_fines_collected"));
            }
        }
        return counts;
    }
}
