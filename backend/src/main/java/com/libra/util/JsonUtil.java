package com.libra.util;

import com.libra.model.Book;
import com.libra.model.Loan;
import com.libra.model.Member;

import java.util.*;

/**
 * JsonUtil
 * 
 * Lightweight, safe JSON serializer implemented in pure Core Java.
 * Converts models, collections, maps, and primitive wrappers into valid JSON strings
 * with rigorous escaping of quotes, backslashes, and control characters.
 */
public class JsonUtil {

    public static String toJson(Object obj) {
        if (obj == null) {
            return "null";
        }

        if (obj instanceof String) {
            return "\"" + escapeString((String) obj) + "\"";
        }

        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }

        if (obj instanceof Book) {
            return bookToJson((Book) obj);
        }

        if (obj instanceof Member) {
            return memberToJson((Member) obj);
        }

        if (obj instanceof Loan) {
            return loanToJson((Loan) obj);
        }

        if (obj instanceof Map) {
            return mapToJson((Map<?, ?>) obj);
        }

        if (obj instanceof Collection) {
            return collectionToJson((Collection<?>) obj);
        }

        if (obj.getClass().isArray()) {
            return arrayToJson(obj);
        }

        // Fallback default: toString escaped
        return "\"" + escapeString(obj.toString()) + "\"";
    }

    private static String bookToJson(Book b) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(b.getId()).append(",");
        sb.append("\"title\":").append(toJson(b.getTitle())).append(",");
        sb.append("\"author\":").append(toJson(b.getAuthor())).append(",");
        sb.append("\"isbn\":").append(toJson(b.getIsbn())).append(",");
        sb.append("\"category\":").append(toJson(b.getCategory())).append(",");
        sb.append("\"totalCopies\":").append(b.getTotalCopies()).append(",");
        sb.append("\"availableCopies\":").append(b.getAvailableCopies()).append(",");
        sb.append("\"createdAt\":").append(toJson(b.getCreatedAt()));
        sb.append("}");
        return sb.toString();
    }

    private static String memberToJson(Member m) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(m.getId()).append(",");
        sb.append("\"name\":").append(toJson(m.getName())).append(",");
        sb.append("\"email\":").append(toJson(m.getEmail())).append(",");
        sb.append("\"phone\":").append(toJson(m.getPhone())).append(",");
        sb.append("\"registrationDate\":").append(toJson(m.getRegistrationDate()));
        sb.append("}");
        return sb.toString();
    }

    private static String loanToJson(Loan l) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(l.getId()).append(",");
        sb.append("\"bookId\":").append(l.getBookId()).append(",");
        sb.append("\"memberId\":").append(l.getMemberId()).append(",");
        sb.append("\"issueDate\":").append(toJson(l.getIssueDate())).append(",");
        sb.append("\"dueDate\":").append(toJson(l.getDueDate())).append(",");
        sb.append("\"returnDate\":").append(toJson(l.getReturnDate())).append(",");
        sb.append("\"status\":").append(toJson(l.getStatus())).append(",");
        sb.append("\"fineAmount\":").append(l.getFineAmount()).append(",");
        sb.append("\"bookTitle\":").append(toJson(l.getBookTitle())).append(",");
        sb.append("\"bookIsbn\":").append(toJson(l.getBookIsbn())).append(",");
        sb.append("\"memberName\":").append(toJson(l.getMemberName())).append(",");
        sb.append("\"memberEmail\":").append(toJson(l.getMemberEmail())).append(",");
        sb.append("\"memberPhone\":").append(toJson(l.getMemberPhone())).append(",");
        sb.append("\"daysOverdue\":").append(l.getDaysOverdue());
        sb.append("}");
        return sb.toString();
    }

    private static String mapToJson(Map<?, ?> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(escapeString(String.valueOf(entry.getKey()))).append("\":");
            sb.append(toJson(entry.getValue()));
        }
        sb.append("}");
        return sb.toString();
    }

    private static String collectionToJson(Collection<?> coll) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (Object item : coll) {
            if (!first) sb.append(",");
            first = false;
            sb.append(toJson(item));
        }
        sb.append("]");
        return sb.toString();
    }

    private static String arrayToJson(Object arr) {
        Object[] items = (Object[]) arr;
        return collectionToJson(Arrays.asList(items));
    }

    /**
     * Correctly escapes special characters according to RFC 8259 JSON specifications.
     */
    public static String escapeString(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':
                    sb.append("\\\"");
                    break;
                case '\\':
                    sb.append("\\\\");
                    break;
                case '\b':
                    sb.append("\\b");
                    break;
                case '\f':
                    sb.append("\\f");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                default:
                    if (c < ' ') {
                        String t = "000" + Integer.toHexString(c);
                        sb.append("\\u").append(t.substring(t.length() - 4));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }
}

