package com.kiandelamarre.dashboard.controller;

import com.kiandelamarre.dashboard.dto.*;
import com.kiandelamarre.dashboard.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LinkMonitorController {


    private final LinkMonitorService linkMonitorService;

    public LinkMonitorController(LinksService linksService, ColumnService columnService, ReorderService reorderService, LinkMonitorService linkMonitorService) {

        this.linkMonitorService = linkMonitorService;

    }

    //returns a list of links and a list of columns
//    @GetMapping("/api/links")
//    public ResponseEntity<List<Link>> getAllLinks() {
//        return ResponseEntity.ok(linksService.getAllLinks());
//    }

    @GetMapping("/status")
    public ResponseEntity<Map<Integer,LinkStatusResponse>> getLinkStatusData() {
        return ResponseEntity.ok(linkMonitorService.checkAllStatuses());
    }



}
