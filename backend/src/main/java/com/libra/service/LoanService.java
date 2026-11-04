package com.libra.service;

import com.libra.config.DatabaseConnection;
import com.libra.dao.BookDAO;
import com.libra.dao.LoanDAO;
import com.libra.dao.MemberDAO;
import com.libra.model.Book;
import com.libra.model.Loan;
import com.libra.model.Member;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * LoanService
 * 
 * Manages circulation workflows with strict ACID transaction guarantees.
 * Ensures stock quantities and loan records are updated atomically with automatic rollback.
 */
public class LoanService {

    private final LoanDAO loanDAO;
    private final BookDAO bookDAO;
    private final MemberDAO memberDAO;

    public LoanService() {
        this.loanDAO = new LoanDAO();
        this.bookDAO = new BookDAO();
        this.memberDAO = new MemberDAO();
    }

    public List<Loan> getAllLoans() throws SQLException {
        return loanDAO.getAllLoans();
    }

    public List<Loan> getActiveLoans() throws SQLException {
        return loanDAO.getActiveLoans();
    }

    public List<Loan> getReturnedLoans() throws SQLException {
        return loanDAO.getReturnedLoans();
    }

    public List<Loan> getOverdueLoans() throws SQLException {
        return loanDAO.getOverdueLoans();
    }

    public List<Loan> getMemberBorrowingHistory(int memberId) throws SQLException {
        return loanDAO.getMemberBorrowingHistory(memberId);
    }

    /**
     * Issues a book to a member inside an atomic JDBC transaction.
     * 
     * Steps:
     * 1. Start transaction (setAutoCommit(false))
     * 2. Verify member exists
     * 3. Verify book exists and has available copies
     * 4. Verify dates (dueDate >= issueDate)
     * 5. Insert loan record into loans table
     * 6. Decrement available_copies in books table
     * 7. Commit transaction
     */
    public Loan issueBook(int bookId, int memberId, String issueDateStr, String dueDateStr)
            throws IllegalArgumentException, IllegalStateException, SQLException {

        // Validate member
        Member member = memberDAO.getMemberById(memberId);
        if (member == null) {
            throw new IllegalArgumentException("Cannot issue book: Member ID " + memberId + " not found.");
        }

        // Validate book
        Book book = bookDAO.getBookById(bookId);
        if (book == null) {
            throw new IllegalArgumentException("Cannot issue book: Book ID " + bookId + " not found.");
        }
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("Cannot issue book: '" + book.getTitle() + "' has 0 available copies.");
        }

        // Validate dates
        LocalDate issueDate = (issueDateStr != null && !issueDateStr.trim().isEmpty())
                ? LocalDate.parse(issueDateStr.trim())
                : LocalDate.now();

        LocalDate dueDate = (dueDateStr != null && !dueDateStr.trim().isEmpty())
                ? LocalDate.parse(dueDateStr.trim())
                : issueDate.plusDays(14); // 14-day default borrowing duration

        if (dueDate.isBefore(issueDate)) {
            throw new IllegalArgumentException("Due date cannot be earlier than issue date.");
        }

        Loan loan = new Loan();
        loan.setBookId(bookId);
        loan.setMemberId(memberId);
        loan.setIssueDate(issueDate.toString());
        loan.setDueDate(dueDate.toString());
        loan.setStatus("ISSUED");
        loan.setFineAmount(0.0);

        // Execute ACID JDBC Transaction
        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Begin transaction

            // Step 1: Create Loan
            boolean loanCreated = loanDAO.createLoan(conn, loan);
            if (!loanCreated) {
                throw new SQLException("Failed to create loan record.");
            }

            // Step 2: Decrease available copies by 1
            boolean stockUpdated = bookDAO.updateAvailableCopies(conn, bookId, -1);
            if (!stockUpdated) {
                throw new IllegalStateException("Failed to decrement book stock (insufficient quantity).");
            }

            conn.commit(); // Commit transaction atomically

            // Populate metadata for response
            loan.setBookTitle(book.getTitle());
            loan.setBookIsbn(book.getIsbn());
            loan.setMemberName(member.getName());
            loan.setMemberEmail(member.getEmail());

            return loan;

        } catch (Exception e) {
            if (conn != null) {
                try {
                    conn.rollback(); // Rollback on any failure
                    System.err.println("[LoanService] Transaction rolled back due to error: " + e.getMessage());
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            if (e instanceof IllegalArgumentException) throw (IllegalArgumentException) e;
            if (e instanceof IllegalStateException) throw (IllegalStateException) e;
            if (e instanceof SQLException) throw (SQLException) e;
            throw new SQLException("Transaction failed: " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
        }
    }

    /**
     * Returns a borrowed book inside an atomic JDBC transaction.
     * 
     * Steps:
     * 1. Start transaction (setAutoCommit(false))
     * 2. Retrieve active loan
     * 3. Verify it has not already been returned
     * 4. Calculate overdue days & fine (₹5 per overdue day)
     * 5. Update loan status to 'RETURNED' with return date and fine
     * 6. Increment available_copies in books table
     * 7. Commit transaction
     */
    public Loan returnBook(int loanId) throws IllegalArgumentException, IllegalStateException, SQLException {
        Loan loan = loanDAO.getLoanById(loanId);
        if (loan == null) {
            throw new IllegalArgumentException("Loan with ID " + loanId + " does not exist.");
        }

        // Business rule: Do not allow the same loan to be returned twice
        if ("RETURNED".equalsIgnoreCase(loan.getStatus())) {
            throw new IllegalStateException("This book loan has already been returned on " + loan.getReturnDate() + ".");
        }

        LocalDate returnDate = LocalDate.now();
        LocalDate dueDate = LocalDate.parse(loan.getDueDate());

        // Fine Calculation: Overdue Days × ₹5
        double fineAmount = 0.0;
        long daysOverdue = 0;

        if (returnDate.isAfter(dueDate)) {
            daysOverdue = ChronoUnit.DAYS.between(dueDate, returnDate);
            fineAmount = daysOverdue * 5.0; // ₹5 per overdue day
        }

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Begin transaction

            // Step 1: Update loan record
            boolean returnSuccess = loanDAO.returnLoan(conn, loanId, returnDate.toString(), fineAmount);
            if (!returnSuccess) {
                throw new SQLException("Failed to update loan return status.");
            }

            // Step 2: Increase available copies by 1
            boolean stockUpdated = bookDAO.updateAvailableCopies(conn, loan.getBookId(), 1);
            if (!stockUpdated) {
                throw new SQLException("Failed to increment book shelf quantity.");
            }

            conn.commit(); // Commit transaction

            // Update in-memory loan for response
            loan.setStatus("RETURNED");
            loan.setReturnDate(returnDate.toString());
            loan.setFineAmount(fineAmount);
            loan.setDaysOverdue(daysOverdue);

            return loan;

        } catch (Exception e) {
            if (conn != null) {
                try {
                    conn.rollback();
                    System.err.println("[LoanService] Return transaction rolled back: " + e.getMessage());
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            if (e instanceof IllegalArgumentException) throw (IllegalArgumentException) e;
            if (e instanceof IllegalStateException) throw (IllegalStateException) e;
            if (e instanceof SQLException) throw (SQLException) e;
            throw new SQLException("Return transaction failed: " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
        }
    }
}

