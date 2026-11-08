package com.kiandelamarre.dashboard.controller;

import com.kiandelamarre.dashboard.dto.*;
import com.kiandelamarre.dashboard.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NetworkDiscoveryController {

    private final WebpageDiscoveryService discoveryService;

    public NetworkDiscoveryController(WebpageDiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }


    @GetMapping("/discover")
    public ResponseEntity<List<Link>> scanLocalNetwork() {
        String host = System.getenv("HOST_IP");
        if (host == null || host.isEmpty()) {
            host = "192.168.1.34";
        }
        int timeoutMs = 200;

        System.out.println("\n\nScanning ports...\n");
        List<Link> activeWebpages = discoveryService.findActiveWebpages(host, timeoutMs);

        if (activeWebpages.isEmpty()) {
            System.out.println("No web services available");
        } else {
            System.out.println("===== Available Web Pages & Titles =====");
            for (Link info : activeWebpages) {
                System.out.println("URL:   " + info.getLocalUrl());
                System.out.println("Title: " + info.getName());
                System.out.println("----------------------------------------");
            }
        }

        return ResponseEntity.ok(activeWebpages);
    }


}
