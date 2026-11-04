package com.libra.service;

import com.libra.dao.MemberDAO;
import com.libra.model.Member;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;

/**
 * MemberService
 * 
 * Enforces business rules and validation logic for library members.
 */
public class MemberService {

    private final MemberDAO memberDAO;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public MemberService() {
        this.memberDAO = new MemberDAO();
    }

    public List<Member> getAllMembers() throws SQLException {
        return memberDAO.getAllMembers();
    }

    public Member getMemberById(int id) throws SQLException {
        return memberDAO.getMemberById(id);
    }

    public List<Member> searchMembers(String query) throws SQLException {
        return memberDAO.searchMembers(query);
    }

    public void addMember(Member member) throws IllegalArgumentException, IllegalStateException, SQLException {
        if (member.getName() == null || member.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Member full name cannot be empty.");
        }

        if (member.getEmail() == null || member.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Member email cannot be empty.");
        }

        String email = member.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Please provide a valid email address format.");
        }

        // Invariant: Prevent duplicate email addresses
        Member existing = memberDAO.getMemberByEmail(email);
        if (existing != null) {
            throw new IllegalStateException("A member with email '" + email + "' is already registered.");
        }

        if (member.getRegistrationDate() == null || member.getRegistrationDate().trim().isEmpty()) {
            member.setRegistrationDate(LocalDate.now().toString());
        }

        member.setEmail(email);
        boolean added = memberDAO.addMember(member);
        if (!added) {
            throw new SQLException("Failed to save member into database.");
        }
    }

    public void updateMember(int id, Member updatedData) throws IllegalArgumentException, IllegalStateException, SQLException {
        Member current = memberDAO.getMemberById(id);
        if (current == null) {
            throw new IllegalArgumentException("Member with ID " + id + " does not exist.");
        }

        if (updatedData.getName() == null || updatedData.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Member name cannot be empty.");
        }

        if (updatedData.getEmail() == null || updatedData.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Member email cannot be empty.");
        }

        String email = updatedData.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format.");
        }

        if (!current.getEmail().equalsIgnoreCase(email)) {
            Member existing = memberDAO.getMemberByEmail(email);
            if (existing != null && existing.getId() != id) {
                throw new IllegalStateException("Email '" + email + "' is already used by another member.");
            }
        }

        updatedData.setId(id);
        updatedData.setEmail(email);

        boolean updated = memberDAO.updateMember(updatedData);
        if (!updated) {
            throw new SQLException("Failed to update member record.");
        }
    }

    public void deleteMember(int id) throws IllegalArgumentException, IllegalStateException, SQLException {
        Member member = memberDAO.getMemberById(id);
        if (member == null) {
            throw new IllegalArgumentException("Member with ID " + id + " does not exist.");
        }

        // Invariant: Do not allow deletion of members with active borrowing records
        int activeLoans = memberDAO.getActiveLoansCountForMember(id);
        if (activeLoans > 0) {
            throw new IllegalStateException(
                "Cannot delete member '" + member.getName() + "' because they have " + activeLoans + " active book loan(s)."
            );
        }

        boolean deleted = memberDAO.deleteMember(id);
        if (!deleted) {
            throw new SQLException("Failed to delete member with ID " + id);
        }
    }
}

