package com.libra.dao;

import com.libra.config.DatabaseConnection;
import com.libra.model.Book;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * BookDAO
 * 
 * Handles all JDBC persistence operations for Books.
 * Uses PreparedStatements for complete protection against SQL injection.
 */
public class BookDAO {

    /**
     * Converts a current row from a ResultSet into a Book domain object.
     */
    private Book mapRowToBook(ResultSet rs) throws SQLException {
        Book book = new Book();
        book.setId(rs.getInt("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setIsbn(rs.getString("isbn"));
        book.setCategory(rs.getString("category"));
        book.setTotalCopies(rs.getInt("total_copies"));
        book.setAvailableCopies(rs.getInt("available_copies"));
        
        Timestamp ts = rs.getTimestamp("created_at");
        book.setCreatedAt(ts != null ? ts.toString() : "");
        return book;
    }

    public List<Book> getAllBooks() throws SQLException {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT id, title, author, isbn, category, total_copies, available_copies, created_at " +
                     "FROM books ORDER BY id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                books.add(mapRowToBook(rs));
            }
        }
        return books;
    }

    public Book getBookById(int id) throws SQLException {
        String sql = "SELECT id, title, author, isbn, category, total_copies, available_copies, created_at " +
                     "FROM books WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToBook(rs);
                }
            }
        }
        return null;
    }

    public Book getBookByIsbn(String isbn) throws SQLException {
        String sql = "SELECT id, title, author, isbn, category, total_copies, available_copies, created_at " +
                     "FROM books WHERE isbn = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, isbn.trim());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToBook(rs);
                }
            }
        }
        return null;
    }

    public List<Book> searchBooks(String query, String category) throws SQLException {
        List<Book> books = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT id, title, author, isbn, category, total_copies, available_copies, created_at FROM books WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (query != null && !query.trim().isEmpty()) {
            sql.append("AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(isbn) LIKE ?) ");
            String wildcard = "%" + query.trim().toLowerCase() + "%";
            params.add(wildcard);
            params.add(wildcard);
            params.add(wildcard);
        }

        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All Categories")) {
            sql.append("AND category = ? ");
            params.add(category.trim());
        }

        sql.append("ORDER BY id DESC");

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    books.add(mapRowToBook(rs));
                }
            }
        }
        return books;
    }

    public boolean addBook(Book book) throws SQLException {
        String sql = "INSERT INTO books (title, author, isbn, category, total_copies, available_copies) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, book.getTitle().trim());
            stmt.setString(2, book.getAuthor().trim());
            stmt.setString(3, book.getIsbn().trim());
            stmt.setString(4, book.getCategory().trim());
            stmt.setInt(5, book.getTotalCopies());
            stmt.setInt(6, book.getAvailableCopies());

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        book.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        }
    }

    public boolean updateBook(Book book) throws SQLException {
        String sql = "UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, total_copies = ?, available_copies = ? " +
                     "WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, book.getTitle().trim());
            stmt.setString(2, book.getAuthor().trim());
            stmt.setString(3, book.getIsbn().trim());
            stmt.setString(4, book.getCategory().trim());
            stmt.setInt(5, book.getTotalCopies());
            stmt.setInt(6, book.getAvailableCopies());
            stmt.setInt(7, book.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteBook(int id) throws SQLException {
        String sql = "DELETE FROM books WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    /**
     * Updates available copies using an existing Connection (part of an active transaction).
     */
    public boolean updateAvailableCopies(Connection conn, int bookId, int delta) throws SQLException {
        String sql = "UPDATE books SET available_copies = available_copies + ? " +
                     "WHERE id = ? AND (available_copies + ?) >= 0 AND (available_copies + ?) <= total_copies";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, delta);
            stmt.setInt(2, bookId);
            stmt.setInt(3, delta);
            stmt.setInt(4, delta);
            return stmt.executeUpdate() > 0;
        }
    }

    public int getActiveLoansCountForBook(int bookId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM loans WHERE book_id = ? AND status = 'ISSUED'";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }
}

