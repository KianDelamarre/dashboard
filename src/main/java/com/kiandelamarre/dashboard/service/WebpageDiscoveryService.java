package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URL;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class WebpageDiscoveryService {

    @Value("${THREAD_POOL:50}")
    private int threadPoolSize;

    @Value("${START_PORT:4000}")
    private int startPort;

    @Value("${END_PORT:9000}")
    private int endPort;

    public List<Link> findActiveWebpages(String host, int timeoutMs) {
        System.out.println("Starting discovery scan on host: " + host + " with timeout: " + timeoutMs + "ms");
        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);

        try {
            List<CompletableFuture<Link>> futures = IntStream.range(startPort, endPort)
                    .mapToObj(port -> CompletableFuture.supplyAsync(() -> {
                        String urlString = "http://" + host + ":" + port;

                        if (checkPortTcp(host, port, timeoutMs)) {
                            System.out.println("Success: TCP port open on " + host + ":" + port);

                            String title = extractWebpageTitle(urlString);
                            if (title != null) {
                                System.out.println("-> Found webpage at " + urlString + " with title: " + title);
                                Link webPageInfo = new Link();
                                webPageInfo.setLocalUrl(urlString);
                                webPageInfo.setName(title);
                                return webPageInfo;
                            } else {
                                System.out.println("-> TCP open on " + port + ", but extraction returned null (not HTML or no title).");
                            }
                        }
                        return null;
                    }, executor))
                    .toList();

            return futures.stream()
                    .map(CompletableFuture::join)
                    .filter(info -> info != null)
                    .collect(Collectors.toList());

        } finally {
            executor.shutdown();
            System.out.println("Discovery scan completed and executor shut down.");
        }
    }

    private boolean checkPortTcp(String host, int port, int timeout) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeout);
            return true;
        } catch (java.net.SocketTimeoutException e) {
            // This means the packet was sent, but nothing answered in time (often firewall drop or silent block)
            System.out.println("-> Port " + port + " TIMED OUT after " + timeout + "ms");
            return false;
        } catch (java.net.ConnectException e) {
            // This means the server actively rejected the connection (normal for closed ports)
            // System.out.println("-> Port " + port + " Connection Refused");
            return false;
        } catch (IOException e) {
            // Any other unexpected IO error
            System.out.println("-> Port " + port + " IO Error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            return false;
        }
    }

    private String extractWebpageTitle(String urlString) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("GET");
            connection.setConnectTimeout(2000);
            connection.setReadTimeout(2000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            int responseCode = connection.getResponseCode();
            String contentType = connection.getContentType();
            System.out.println("HTTP Connection to " + urlString + " -> Response Code: " + responseCode + ", Content-Type: " + contentType);

            if (responseCode >= 200 && responseCode < 400) {
                if (contentType != null && contentType.toLowerCase().contains("text/html")) {

                    StringBuilder htmlContent = new StringBuilder();
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            htmlContent.append(line);
                            if (line.toLowerCase().contains("</title>")) {
                                break;
                            }
                        }
                    }

                    String html = htmlContent.toString();
                    int startIdx = html.toLowerCase().indexOf("<title>");
                    int endIdx = html.toLowerCase().indexOf("</title>");

                    if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                        int tagCloseIdx = html.indexOf(">", startIdx);
                        if (tagCloseIdx != -1 && tagCloseIdx < endIdx) {
                            return html.substring(tagCloseIdx + 1, endIdx).trim();
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Failed to fetch/parse title for " + urlString + " -> Error: " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }
        return null;
    }
}