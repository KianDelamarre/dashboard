package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
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

    public List<Link> findActiveWebpages(String host, int timeoutMs) {
        // Create a fixed thread pool.
        ExecutorService executor = Executors.newFixedThreadPool(200);

        try {
            // 1. Map every port in the range to an asynchronous task
            List<CompletableFuture<Link>> futures = IntStream.range(3000, 9000)
                    .mapToObj(port -> CompletableFuture.supplyAsync(() -> {
                        String urlString = "http://" + host + ":" + port;

                        System.out.println("checking "+ urlString);

                        if (checkPortTcp(host, port, timeoutMs)) {
                            System.out.println("Success: Something is listening on " + host + ":" + port);

                            String title = extractWebpageTitle(urlString);
                            if (title != null) {
                                System.out.println("-> Found webpage with title: " + title);
                                Link webPageInfo = new Link();
                                webPageInfo.setLocalUrl(urlString);
                                webPageInfo.setName(title);
                                return webPageInfo;
                            } else {
                                System.out.println("-> TCP open, but not a valid HTML webpage.");
                            }
                        }
                        return null; // Return null if it's closed or not a webpage
                    }, executor))
                    .toList();

            // 2. Wait for all futures to complete, join their results, and filter out nulls
            return futures.stream()
                    .map(CompletableFuture::join) // Blocks until this specific thread finishes
                    .filter(info -> info != null)    // Keep only successful webpages
                    .collect(Collectors.toList());

        } finally {
            // Always shut down the executor service to prevent thread leaks
            executor.shutdown();
        }
    }

    private boolean checkPortTcp(String host, int port, int timeout) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeout);
            return true;
        } catch (IOException e) {
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

            if (responseCode >= 200 && responseCode < 400) {
                if (contentType != null && contentType.toLowerCase().contains("text/html")) {

                    // Read HTML stream and search for <title>
                    StringBuilder htmlContent = new StringBuilder();
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            htmlContent.append(line);
                            // Stop reading early once we pass the closing title tag to save time
                            if (line.toLowerCase().contains("</title>")) {
                                break;
                            }
                        }
                    }

                    // Parse title tag using string matching
                    String html = htmlContent.toString();
                    int startIdx = html.toLowerCase().indexOf("<title>");
                    int endIdx = html.toLowerCase().indexOf("</title>");

                    if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                        int tagCloseIdx = html.indexOf(">", startIdx);
                        if (tagCloseIdx != -1 && tagCloseIdx < endIdx) {
                            // Extract and clean up whitespace
                            return html.substring(tagCloseIdx + 1, endIdx).trim();
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Failed to fetch or parse title
        }
        return null; // Return null if it's not a webpage or has no title
    }
}