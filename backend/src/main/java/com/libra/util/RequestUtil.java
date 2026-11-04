package com.libra.util;

import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * RequestUtil
 * 
 * Helper for extracting URL parameters, query strings, and form-urlencoded bodies
 * using standard Java UTF-8 encoding.
 */
public class RequestUtil {

    /**
     * Reads the entire body from an incoming HTTP request as a UTF-8 string.
     */
    public static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[1024];
        int nRead;
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        return new String(buffer.toByteArray(), StandardCharsets.UTF_8);
    }

    /**
     * Parses an application/x-www-form-urlencoded string into key-value pairs.
     */
    public static Map<String, String> parseFormData(String body) {
        Map<String, String> params = new HashMap<>();
        if (body == null || body.trim().isEmpty()) {
            return params;
        }

        String[] pairs = body.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String value = (idx < pair.length() - 1)
                        ? URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8)
                        : "";
                params.put(key, value);
            } else if (idx == -1 && !pair.isEmpty()) {
                String key = URLDecoder.decode(pair, StandardCharsets.UTF_8);
                params.put(key, "");
            }
        }
        return params;
    }

    /**
     * Parses query parameters from the request URI (e.g. "?query=code&category=CS").
     */
    public static Map<String, String> parseQueryParams(HttpExchange exchange) {
        Map<String, String> params = new HashMap<>();
        String rawQuery = exchange.getRequestURI().getRawQuery();
        if (rawQuery == null || rawQuery.trim().isEmpty()) {
            return params;
        }

        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String value = (idx < pair.length() - 1)
                        ? URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8)
                        : "";
                params.put(key, value);
            }
        }
        return params;
    }

    /**
     * Extracts an integer path parameter from a pattern like "/api/books/{id}".
     */
    public static Integer extractIdFromPath(String path, String prefix) {
        if (path == null || !path.startsWith(prefix)) {
            return null;
        }
        String rest = path.substring(prefix.length());
        if (rest.startsWith("/")) rest = rest.substring(1);
        int slashIdx = rest.indexOf("/");
        String idStr = (slashIdx != -1) ? rest.substring(0, slashIdx) : rest;

        try {
            return Integer.parseInt(idStr);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

