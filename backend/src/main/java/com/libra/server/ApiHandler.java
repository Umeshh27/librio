package com.libra.server;

import com.libra.model.Book;
import com.libra.model.Loan;
import com.libra.model.Member;
import com.libra.service.BookService;
import com.libra.service.DashboardService;
import com.libra.service.LoanService;
import com.libra.service.MemberService;
import com.libra.util.RequestUtil;
import com.libra.util.ResponseUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ApiHandler
 * 
 * Central HTTP request dispatcher for all /api endpoints.
 * Intercepts HTTP verbs, parses query/form parameters, handles CORS preflight,
 * executes service logic, and responds with standard JSON envelopes.
 */
public class ApiHandler implements HttpHandler {

    private final BookService bookService;
    private final MemberService memberService;
    private final LoanService loanService;
    private final DashboardService dashboardService;

    public ApiHandler() {
        this.bookService = new BookService();
        this.memberService = new MemberService();
        this.loanService = new LoanService();
        this.dashboardService = new DashboardService();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod().toUpperCase();
        String path = exchange.getRequestURI().getPath();

        // 1. Handle CORS Preflight OPTIONS requests
        if ("OPTIONS".equals(method)) {
            ResponseUtil.handleOptions(exchange);
            return;
        }

        try {
            // 2. Health check
            if ("/api/health".equals(path)) {
                Map<String, Object> health = new HashMap<>();
                health.put("status", "UP");
                health.put("database", "CONNECTED");
                health.put("server", "Core Java Built-in HttpServer");
                ResponseUtil.sendSuccess(exchange, 200, "LIBRIO API is online and operational", health);
                return;
            }

            // 3. Dashboard endpoint
            if ("/api/dashboard".equals(path) && "GET".equals(method)) {
                Map<String, Object> data = dashboardService.getDashboardData();
                ResponseUtil.sendSuccess(exchange, 200, "Dashboard telemetry retrieved", data);
                return;
            }

            // 4. Books routing
            if (path.startsWith("/api/books")) {
                handleBooks(exchange, method, path);
                return;
            }

            // 5. Members routing
            if (path.startsWith("/api/members")) {
                handleMembers(exchange, method, path);
                return;
            }

            // 6. Loans circulation routing
            if (path.startsWith("/api/loans")) {
                handleLoans(exchange, method, path);
                return;
            }

            // 7. Reports routing
            if (path.startsWith("/api/reports")) {
                handleReports(exchange, method, path);
                return;
            }

            // Route Not Found
            ResponseUtil.sendError(exchange, 404, "Endpoint not found: " + method + " " + path);

        } catch (IllegalArgumentException e) {
            System.err.println("[ApiHandler] Validation Error (400): " + e.getMessage());
            ResponseUtil.sendError(exchange, 400, e.getMessage());
        } catch (IllegalStateException e) {
            System.err.println("[ApiHandler] Business Conflict (409): " + e.getMessage());
            ResponseUtil.sendError(exchange, 409, e.getMessage());
        } catch (SQLException e) {
            System.err.println("[ApiHandler] Database Exception (500): " + e.getMessage());
            e.printStackTrace();
            ResponseUtil.sendError(exchange, 500, "A database error occurred while processing the request.");
        } catch (Exception e) {
            System.err.println("[ApiHandler] Unexpected Exception (500): " + e.getMessage());
            e.printStackTrace();
            ResponseUtil.sendError(exchange, 500, "An unexpected server error occurred.");
        }
    }

    // ==========================================
    // BOOKS HANDLERS
    // ==========================================
    private void handleBooks(HttpExchange exchange, String method, String path) throws Exception {
        // GET /api/books or GET /api/books?query=...&category=...
        if ("/api/books".equals(path) && "GET".equals(method)) {
            Map<String, String> queryParams = RequestUtil.parseQueryParams(exchange);
            String search = queryParams.get("query");
            String category = queryParams.get("category");

            List<Book> books;
            if ((search != null && !search.isEmpty()) || (category != null && !category.isEmpty())) {
                books = bookService.searchBooks(search, category);
            } else {
                books = bookService.getAllBooks();
            }
            ResponseUtil.sendSuccess(exchange, 200, "Books retrieved", books);
            return;
        }

        // POST /api/books (Create new book)
        if ("/api/books".equals(path) && "POST".equals(method)) {
            String body = RequestUtil.readRequestBody(exchange);
            Map<String, String> form = RequestUtil.parseFormData(body);

            String title = form.get("title");
            String author = form.get("author");
            String isbn = form.get("isbn");
            String category = form.getOrDefault("category", "General");
            int totalCopies = parseInt(form.get("totalCopies"), 1);

            Book newBook = new Book(title, author, isbn, category, totalCopies);
            bookService.addBook(newBook);

            ResponseUtil.sendSuccess(exchange, 201, "Book created successfully in catalog", newBook);
            return;
        }

        // Sub-routes with {id}
        Integer id = RequestUtil.extractIdFromPath(path, "/api/books/");
        if (id == null) {
            ResponseUtil.sendError(exchange, 400, "Invalid Book ID format in path.");
            return;
        }

        // GET /api/books/{id}
        if ("GET".equals(method)) {
            Book book = bookService.getBookById(id);
            if (book == null) {
                ResponseUtil.sendError(exchange, 404, "Book not found with ID: " + id);
            } else {
                ResponseUtil.sendSuccess(exchange, 200, "Book details retrieved", book);
            }
            return;
        }

        // PUT /api/books/{id} (Update book)
        if ("PUT".equals(method)) {
            String body = RequestUtil.readRequestBody(exchange);
            Map<String, String> form = RequestUtil.parseFormData(body);

            String title = form.get("title");
            String author = form.get("author");
            String isbn = form.get("isbn");
            String category = form.get("category");
            int totalCopies = parseInt(form.get("totalCopies"), 1);

            Book updated = new Book();
            updated.setTitle(title);
            updated.setAuthor(author);
            updated.setIsbn(isbn);
            updated.setCategory(category);
            updated.setTotalCopies(totalCopies);

            bookService.updateBook(id, updated);
            ResponseUtil.sendSuccess(exchange, 200, "Book updated successfully", updated);
            return;
        }

        // DELETE /api/books/{id}
        if ("DELETE".equals(method)) {
            bookService.deleteBook(id);
            ResponseUtil.sendSuccess(exchange, 200, "Book deleted successfully", null);
            return;
        }

        ResponseUtil.sendError(exchange, 405, "Method Not Allowed for /api/books");
    }

    // ==========================================
    // MEMBERS HANDLERS
    // ==========================================
    private void handleMembers(HttpExchange exchange, String method, String path) throws Exception {
        // GET /api/members
        if ("/api/members".equals(path) && "GET".equals(method)) {
            Map<String, String> queryParams = RequestUtil.parseQueryParams(exchange);
            String search = queryParams.get("query");

            List<Member> members;
            if (search != null && !search.isEmpty()) {
                members = memberService.searchMembers(search);
            } else {
                members = memberService.getAllMembers();
            }
            ResponseUtil.sendSuccess(exchange, 200, "Members retrieved", members);
            return;
        }

        // POST /api/members (Register member)
        if ("/api/members".equals(path) && "POST".equals(method)) {
            String body = RequestUtil.readRequestBody(exchange);
            Map<String, String> form = RequestUtil.parseFormData(body);

            String name = form.get("name");
            String email = form.get("email");
            String phone = form.get("phone");

            Member member = new Member(name, email, phone, null);
            memberService.addMember(member);

            ResponseUtil.sendSuccess(exchange, 201, "Member registered successfully", member);
            return;
        }

        // Sub-routes with {id}
        Integer id = RequestUtil.extractIdFromPath(path, "/api/members/");
        if (id == null) {
            ResponseUtil.sendError(exchange, 400, "Invalid Member ID format in path.");
            return;
        }

        // GET /api/members/{id}
        if ("GET".equals(method)) {
            Member member = memberService.getMemberById(id);
            if (member == null) {
                ResponseUtil.sendError(exchange, 404, "Member not found with ID: " + id);
            } else {
                ResponseUtil.sendSuccess(exchange, 200, "Member details retrieved", member);
            }
            return;
        }

        // PUT /api/members/{id}
        if ("PUT".equals(method)) {
            String body = RequestUtil.readRequestBody(exchange);
            Map<String, String> form = RequestUtil.parseFormData(body);

            String name = form.get("name");
            String email = form.get("email");
            String phone = form.get("phone");

            Member updated = new Member(name, email, phone, null);
            memberService.updateMember(id, updated);

            ResponseUtil.sendSuccess(exchange, 200, "Member details updated", updated);
            return;
        }

        // DELETE /api/members/{id}
        if ("DELETE".equals(method)) {
            memberService.deleteMember(id);
            ResponseUtil.sendSuccess(exchange, 200, "Member deleted successfully", null);
            return;
        }

        ResponseUtil.sendError(exchange, 405, "Method Not Allowed for /api/members");
    }

    // ==========================================
    // LOANS CIRCULATION HANDLERS
    // ==========================================
    private void handleLoans(HttpExchange exchange, String method, String path) throws Exception {
        // GET /api/loans
        if ("/api/loans".equals(path) && "GET".equals(method)) {
            List<Loan> loans = loanService.getAllLoans();
            ResponseUtil.sendSuccess(exchange, 200, "All loans retrieved", loans);
            return;
        }

        // GET /api/loans/active
        if ("/api/loans/active".equals(path) && "GET".equals(method)) {
            List<Loan> active = loanService.getActiveLoans();
            ResponseUtil.sendSuccess(exchange, 200, "Active loans retrieved", active);
            return;
        }

        // GET /api/loans/history
        if ("/api/loans/history".equals(path) && "GET".equals(method)) {
            List<Loan> history = loanService.getAllLoans();
            ResponseUtil.sendSuccess(exchange, 200, "Borrowing history retrieved", history);
            return;
        }

        // GET /api/loans/overdue
        if ("/api/loans/overdue".equals(path) && "GET".equals(method)) {
            List<Loan> overdue = loanService.getOverdueLoans();
            ResponseUtil.sendSuccess(exchange, 200, "Overdue loans retrieved", overdue);
            return;
        }

        // POST /api/loans (Issue a book)
        if ("/api/loans".equals(path) && "POST".equals(method)) {
            String body = RequestUtil.readRequestBody(exchange);
            Map<String, String> form = RequestUtil.parseFormData(body);

            int bookId = parseInt(form.get("bookId"), -1);
            int memberId = parseInt(form.get("memberId"), -1);
            String issueDate = form.get("issueDate");
            String dueDate = form.get("dueDate");

            if (bookId <= 0 || memberId <= 0) {
                ResponseUtil.sendError(exchange, 400, "Valid bookId and memberId are required.");
                return;
            }

            Loan loan = loanService.issueBook(bookId, memberId, issueDate, dueDate);
            ResponseUtil.sendSuccess(exchange, 201, "Book issued successfully", loan);
            return;
        }

        // PUT /api/loans/{id}/return (Return a book)
        if (path.matches("^/api/loans/\\d+/return$") && "PUT".equals(method)) {
            String idStr = path.replaceAll("[^0-9]", "");
            int loanId = Integer.parseInt(idStr);

            Loan returnedLoan = loanService.returnBook(loanId);
            String fineMsg = (returnedLoan.getFineAmount() > 0)
                    ? String.format(" Book returned with overdue fine of ₹%.2f.", returnedLoan.getFineAmount())
                    : " Book returned on time with ₹0 fine.";

            ResponseUtil.sendSuccess(exchange, 200, "Book returned successfully!" + fineMsg, returnedLoan);
            return;
        }

        ResponseUtil.sendError(exchange, 404, "Loan endpoint not found: " + path);
    }

    // ==========================================
    // REPORTS HANDLERS
    // ==========================================
    private void handleReports(HttpExchange exchange, String method, String path) throws Exception {
        if (!"GET".equals(method)) {
            ResponseUtil.sendError(exchange, 405, "Only GET method supported on reports endpoints.");
            return;
        }

        if ("/api/reports/summary".equals(path)) {
            ResponseUtil.sendSuccess(exchange, 200, "Reports summary retrieved", dashboardService.getReportsSummary());
            return;
        }

        if ("/api/reports/popular-books".equals(path)) {
            ResponseUtil.sendSuccess(exchange, 200, "Popular books retrieved", dashboardService.getPopularBooks(10));
            return;
        }

        if ("/api/reports/categories".equals(path)) {
            ResponseUtil.sendSuccess(exchange, 200, "Categories distribution retrieved", dashboardService.getCategoryDistribution());
            return;
        }

        if ("/api/reports/monthly-borrowing".equals(path)) {
            ResponseUtil.sendSuccess(exchange, 200, "Monthly borrowing statistics retrieved", dashboardService.getMonthlyBorrowing());
            return;
        }

        ResponseUtil.sendError(exchange, 404, "Report endpoint not found: " + path);
    }

    private int parseInt(String val, int defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}

