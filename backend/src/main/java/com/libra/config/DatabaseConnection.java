package com.libra.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * DatabaseConnection
 * 
 * Responsible for loading database configuration and establishing
 * new JDBC connections to MySQL.
 * 
 * Each database operation requests a new Connection to avoid multi-threaded
 * state corruption and ensure clean transaction boundaries.
 */
public class DatabaseConnection {

    private static String dbUrl = "jdbc:mysql://localhost:3306/libra_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static String dbUsername = "root";
    private static String dbPassword = "root";

    static {
        // 1. Attempt to load properties from external configuration file
        loadConfiguration();

        // 2. Allow system environment variables to override properties if present
        String envUrl = System.getenv("DB_URL");
        String envUser = System.getenv("DB_USERNAME");
        String envPass = System.getenv("DB_PASSWORD");

        if (envUrl != null && !envUrl.trim().isEmpty()) dbUrl = envUrl.trim();
        if (envUser != null && !envUser.trim().isEmpty()) dbUsername = envUser.trim();
        if (envPass != null) dbPassword = envPass;

        // 3. Register MySQL JDBC driver
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[DatabaseConnection] MySQL JDBC Driver registered successfully.");
        } catch (ClassNotFoundException e) {
            System.err.println("[DatabaseConnection] ERROR: MySQL Connector/J driver not found on classpath!");
            e.printStackTrace();
        }
    }

    private static void loadConfiguration() {
        Properties props = new Properties();
        File[] candidateFiles = new File[] {
            new File("config/application.properties"),
            new File("../config/application.properties"),
            new File("backend/config/application.properties")
        };

        for (File file : candidateFiles) {
            if (file.exists() && file.isFile()) {
                try (InputStream in = new FileInputStream(file)) {
                    props.load(in);
                    if (props.getProperty("db.url") != null) dbUrl = props.getProperty("db.url").trim();
                    if (props.getProperty("db.username") != null) dbUsername = props.getProperty("db.username").trim();
                    if (props.getProperty("db.password") != null) dbPassword = props.getProperty("db.password").trim();
                    System.out.println("[DatabaseConnection] Loaded config from: " + file.getAbsolutePath());
                    return;
                } catch (IOException e) {
                    System.err.println("[DatabaseConnection] Warning: Could not read " + file.getPath() + ": " + e.getMessage());
                }
            }
        }
    }

    /**
     * Establishes and returns a fresh JDBC Connection.
     * Callers must close the connection (or use try-with-resources).
     *
     * @return Connection active JDBC connection to MySQL
     * @throws SQLException if a database access error occurs
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl, dbUsername, dbPassword);
    }

    /**
     * Verifies that the MySQL server is reachable.
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DatabaseConnection] Connection test failed: " + e.getMessage());
            return false;
        }
    }

    public static String getDbUrl() {
        return dbUrl;
    }

    public static String getDbUsername() {
        return dbUsername;
    }
}

