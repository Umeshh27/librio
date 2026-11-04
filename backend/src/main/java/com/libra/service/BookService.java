package com.libra.service;

import com.libra.dao.BookDAO;
import com.libra.model.Book;

import java.sql.SQLException;
import java.util.List;

/**
 * BookService
 * 
 * Enforces business rules and validation logic for book operations.
 */
public class BookService {

    private final BookDAO bookDAO;

    public BookService() {
        this.bookDAO = new BookDAO();
    }

    public List<Book> getAllBooks() throws SQLException {
        return bookDAO.getAllBooks();
    }

    public Book getBookById(int id) throws SQLException {
        return bookDAO.getBookById(id);
    }

    public List<Book> searchBooks(String query, String category) throws SQLException {
        return bookDAO.searchBooks(query, category);
    }

    public void addBook(Book book) throws IllegalArgumentException, IllegalStateException, SQLException {
        // Invariant 1: Title and Author cannot be empty
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Book title cannot be empty.");
        }
        if (book.getAuthor() == null || book.getAuthor().trim().isEmpty()) {
            throw new IllegalArgumentException("Book author cannot be empty.");
        }

        // Invariant 2: ISBN cannot be empty and must be unique
        if (book.getIsbn() == null || book.getIsbn().trim().isEmpty()) {
            throw new IllegalArgumentException("Book ISBN cannot be empty.");
        }
        Book existing = bookDAO.getBookByIsbn(book.getIsbn());
        if (existing != null) {
            throw new IllegalStateException("A book with ISBN '" + book.getIsbn() + "' already exists in catalog.");
        }

        // Invariant 3: Total copies must be positive
        if (book.getTotalCopies() <= 0) {
            throw new IllegalArgumentException("Total copies must be a positive integer greater than zero.");
        }

        // Newly added books have all copies available
        book.setAvailableCopies(book.getTotalCopies());

        boolean added = bookDAO.addBook(book);
        if (!added) {
            throw new SQLException("Failed to persist new book record into database.");
        }
    }

    public void updateBook(int id, Book updatedData) throws IllegalArgumentException, IllegalStateException, SQLException {
        Book current = bookDAO.getBookById(id);
        if (current == null) {
            throw new IllegalArgumentException("Book with ID " + id + " does not exist.");
        }

        if (updatedData.getTitle() == null || updatedData.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Book title cannot be empty.");
        }
        if (updatedData.getAuthor() == null || updatedData.getAuthor().trim().isEmpty()) {
            throw new IllegalArgumentException("Book author cannot be empty.");
        }

        // If ISBN changed, check uniqueness
        if (!current.getIsbn().equalsIgnoreCase(updatedData.getIsbn().trim())) {
            Book existing = bookDAO.getBookByIsbn(updatedData.getIsbn());
            if (existing != null && existing.getId() != id) {
                throw new IllegalStateException("ISBN '" + updatedData.getIsbn() + "' is already assigned to another book.");
            }
        }

        if (updatedData.getTotalCopies() <= 0) {
            throw new IllegalArgumentException("Total copies must be at least 1.");
        }

        // Invariant: Do not allow the total number of copies to be reduced below the number of currently issued copies
        int issuedCopies = current.getTotalCopies() - current.getAvailableCopies();
        if (updatedData.getTotalCopies() < issuedCopies) {
            throw new IllegalStateException(
                "Cannot reduce total copies to " + updatedData.getTotalCopies() + 
                ". There are currently " + issuedCopies + " copies issued to members."
            );
        }

        // Adjust available copies based on new total and existing issued count
        int newAvailable = updatedData.getTotalCopies() - issuedCopies;
        updatedData.setId(id);
        updatedData.setAvailableCopies(newAvailable);

        boolean updated = bookDAO.updateBook(updatedData);
        if (!updated) {
            throw new SQLException("Failed to update book record in database.");
        }
    }

    public void deleteBook(int id) throws IllegalArgumentException, IllegalStateException, SQLException {
        Book book = bookDAO.getBookById(id);
        if (book == null) {
            throw new IllegalArgumentException("Book with ID " + id + " does not exist.");
        }

        // Invariant: Do not allow deletion if the book has active borrowing records
        int activeLoans = bookDAO.getActiveLoansCountForBook(id);
        if (activeLoans > 0 || book.getAvailableCopies() < book.getTotalCopies()) {
            throw new IllegalStateException(
                "Cannot delete '" + book.getTitle() + "' because there are " + 
                (book.getTotalCopies() - book.getAvailableCopies()) + " active borrowing records."
            );
        }

        boolean deleted = bookDAO.deleteBook(id);
        if (!deleted) {
            throw new SQLException("Failed to delete book with ID " + id);
        }
    }
}

