package com.libra;

import com.libra.config.DatabaseConnection;
import com.libra.server.ApiServer;

/**
 * Main Entry Point
 * 
 * Verifies MySQL database connectivity, initializes the built-in HTTP server,
 * and starts listening for incoming REST API requests from the React frontend.
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("Starting LIBRIO System Core...");

        // 1. Verify MySQL connectivity
        System.out.println("[Main] Testing MySQL database connection to " + DatabaseConnection.getDbUrl() + "...");
        boolean connected = DatabaseConnection.testConnection();
        if (!connected) {
            System.err.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            System.err.println("  CRITICAL ERROR: Unable to establish connection to MySQL database!");
            System.err.println("  Please ensure MySQL service is running and credentials in");
            System.err.println("  config/application.properties or environment variables are correct.");
            System.err.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        } else {
            System.out.println("[Main] SUCCESS: MySQL database connection verified!");
        }

        // 2. Determine port (default: 5000)
        int port = 5000;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.trim().isEmpty()) {
            try {
                port = Integer.parseInt(envPort.trim());
            } catch (NumberFormatException ignored) {}
        }

        // 3. Initialize and start the HTTP server
        try {
            ApiServer apiServer = new ApiServer(port);
            apiServer.start();

            // Register shutdown hook for graceful exit
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n[Main] Shutdown hook triggered. Shutting down LIBRIO server...");
                apiServer.stop();
            }));

        } catch (Exception e) {
            System.err.println("[Main] FATAL: Could not start HTTP server on port " + port + ": " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}

