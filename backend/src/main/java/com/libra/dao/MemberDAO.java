package com.libra.dao;

import com.libra.config.DatabaseConnection;
import com.libra.model.Member;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * MemberDAO
 * 
 * Handles JDBC persistence operations for library members.
 */
public class MemberDAO {

    private Member mapRowToMember(ResultSet rs) throws SQLException {
        Member member = new Member();
        member.setId(rs.getInt("id"));
        member.setName(rs.getString("name"));
        member.setEmail(rs.getString("email"));
        member.setPhone(rs.getString("phone"));

        Date regDate = rs.getDate("registration_date");
        member.setRegistrationDate(regDate != null ? regDate.toString() : "");
        return member;
    }

    public List<Member> getAllMembers() throws SQLException {
        List<Member> members = new ArrayList<>();
        String sql = "SELECT id, name, email, phone, registration_date FROM members ORDER BY id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                members.add(mapRowToMember(rs));
            }
        }
        return members;
    }

    public Member getMemberById(int id) throws SQLException {
        String sql = "SELECT id, name, email, phone, registration_date FROM members WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToMember(rs);
                }
            }
        }
        return null;
    }

    public Member getMemberByEmail(String email) throws SQLException {
        String sql = "SELECT id, name, email, phone, registration_date FROM members WHERE LOWER(email) = LOWER(?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToMember(rs);
                }
            }
        }
        return null;
    }

    public List<Member> searchMembers(String query) throws SQLException {
        List<Member> members = new ArrayList<>();
        String sql = "SELECT id, name, email, phone, registration_date FROM members " +
                     "WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? " +
                     "ORDER BY id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            String wildcard = "%" + (query != null ? query.trim().toLowerCase() : "") + "%";
            stmt.setString(1, wildcard);
            stmt.setString(2, wildcard);
            stmt.setString(3, wildcard);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    members.add(mapRowToMember(rs));
                }
            }
        }
        return members;
    }

    public boolean addMember(Member member) throws SQLException {
        String sql = "INSERT INTO members (name, email, phone, registration_date) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, member.getName().trim());
            stmt.setString(2, member.getEmail().trim().toLowerCase());
            stmt.setString(3, member.getPhone() != null ? member.getPhone().trim() : null);
            stmt.setDate(4, Date.valueOf(member.getRegistrationDate()));

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        member.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        }
    }

    public boolean updateMember(Member member) throws SQLException {
        String sql = "UPDATE members SET name = ?, email = ?, phone = ? WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, member.getName().trim());
            stmt.setString(2, member.getEmail().trim().toLowerCase());
            stmt.setString(3, member.getPhone() != null ? member.getPhone().trim() : null);
            stmt.setInt(4, member.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteMember(int id) throws SQLException {
        String sql = "DELETE FROM members WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    public int getActiveLoansCountForMember(int memberId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM loans WHERE member_id = ? AND status = 'ISSUED'";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, memberId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }
}

