package com.libra.service;

import com.libra.dao.LoanDAO;
import com.libra.model.Loan;

import java.sql.SQLException;
import java.util.*;

/**
 * DashboardService
 * 
 * Aggregates live MySQL telemetry for the executive overview dashboard and reports.
 */
public class DashboardService {

    private final LoanDAO loanDAO;

    public DashboardService() {
        this.loanDAO = new LoanDAO();
    }

    public Map<String, Object> getDashboardData() throws SQLException {
        Map<String, Object> dashboard = new HashMap<>();

        // 1. Basic counts
        Map<String, Object> counts = loanDAO.getDashboardCounts();
        dashboard.put("totalBooks", counts.getOrDefault("totalBooks", 0));
        dashboard.put("availableBooks", counts.getOrDefault("availableBooks", 0));
        dashboard.put("issuedBooks", counts.getOrDefault("issuedBooks", 0));
        dashboard.put("totalMembers", counts.getOrDefault("totalMembers", 0));
        dashboard.put("returnedBooks", counts.getOrDefault("returnedBooks", 0));
        dashboard.put("overdueBooks", counts.getOrDefault("overdueBooks", 0));
        dashboard.put("totalFinesCollected", counts.getOrDefault("totalFinesCollected", 0.0));

        // 2. Charts telemetry
        dashboard.put("monthlyBorrowing", loanDAO.getMonthlyBorrowingStats());
        dashboard.put("categories", loanDAO.getCategoryDistribution());
        dashboard.put("popularBooks", loanDAO.getPopularBooks(5));

        // 3. Recent activity list compiled from recent loans
        List<Loan> recentLoans = loanDAO.getAllLoans();
        List<Map<String, Object>> activities = new ArrayList<>();

        int limit = Math.min(5, recentLoans.size());
        for (int i = 0; i < limit; i++) {
            Loan l = recentLoans.get(i);
            Map<String, Object> act = new HashMap<>();
            act.put("id", l.getId());
            if ("RETURNED".equalsIgnoreCase(l.getStatus())) {
                act.put("type", "RETURN");
                act.put("description", "Returned \"" + l.getBookTitle() + "\" by " + l.getMemberName());
                act.put("date", l.getReturnDate());
            } else {
                act.put("type", "ISSUE");
                act.put("description", "Issued \"" + l.getBookTitle() + "\" to " + l.getMemberName());
                act.put("date", l.getIssueDate());
            }
            activities.add(act);
        }
        dashboard.put("recentActivities", activities);

        return dashboard;
    }

    public Map<String, Object> getReportsSummary() throws SQLException {
        return loanDAO.getDashboardCounts();
    }

    public List<Map<String, Object>> getMonthlyBorrowing() throws SQLException {
        return loanDAO.getMonthlyBorrowingStats();
    }

    public List<Map<String, Object>> getCategoryDistribution() throws SQLException {
        return loanDAO.getCategoryDistribution();
    }

    public List<Map<String, Object>> getPopularBooks(int limit) throws SQLException {
        return loanDAO.getPopularBooks(limit);
    }
}

