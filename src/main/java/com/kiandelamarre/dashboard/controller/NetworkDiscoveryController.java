package com.kiandelamarre.dashboard.controller;

import com.kiandelamarre.dashboard.dto.*;
import com.kiandelamarre.dashboard.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class NetworkDiscoveryController {

    private final WebpageDiscoveryService discoveryService;

    public NetworkDiscoveryController(WebpageDiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }


    @GetMapping("/discover")
    public ResponseEntity<List<WebpageInfo>> scanLocalNetwork() {
        String host = "192.168.1.34";
        int timeoutMs = 200;

        System.out.println("\n\nScanning ports...\n");
        List<WebpageInfo> activeWebpages = discoveryService.findActiveWebpages(host, timeoutMs);

        if (activeWebpages.isEmpty()) {
            System.out.println("No web services available");
        } else {
            System.out.println("===== Available Web Pages & Titles =====");
            for (WebpageInfo info : activeWebpages) {
                System.out.println("URL:   " + info.getUrl());
                System.out.println("Title: " + info.getTitle());
                System.out.println("----------------------------------------");
            }
        }

        return ResponseEntity.ok(activeWebpages);
    }


}
