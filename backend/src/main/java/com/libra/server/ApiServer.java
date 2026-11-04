package com.libra.server;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * ApiServer
 * 
 * Embeds Java's built-in HttpServer (com.sun.net.httpserver.HttpServer)
 * to serve RESTful endpoints on port 5000 with multi-threaded executor support.
 */
public class ApiServer {

    private final int port;
    private HttpServer server;

    public ApiServer(int port) {
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api", new ApiHandler());

        // Multi-threaded thread pool for handling simultaneous client requests
        server.setExecutor(Executors.newFixedThreadPool(12));
        server.start();

        System.out.println("==================================================================");
        System.out.println("  LIBRIO — Intelligent Library Management Backend");
        System.out.println("  Running on: http://localhost:" + port + "/api");
        System.out.println("  CORS Origin: http://localhost:5173");
        System.out.println("  Technology: Core Java 21 LTS + JDBC + Built-in HttpServer");
        System.out.println("==================================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(1);
            System.out.println("[ApiServer] Server stopped.");
        }
    }
}

