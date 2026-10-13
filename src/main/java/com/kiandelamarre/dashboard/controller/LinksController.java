package com.kiandelamarre.dashboard.controller;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.dto.LinkStatus;
import com.kiandelamarre.dashboard.service.LinkMonitorService;
import com.kiandelamarre.dashboard.service.LinksService;
import com.kiandelamarre.dashboard.service.ReorderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/")
public class LinksController {

    private final LinksService linksService;
    private final ReorderService reorderService;
    private final LinkMonitorService linkMonitorService;

    public LinksController(LinksService linksService, ReorderService reorderService, LinkMonitorService linkMonitorService) {
        this.linksService = linksService;
        this.reorderService = reorderService;
        this.linkMonitorService = linkMonitorService;

    }

    @GetMapping("/links")
    public ResponseEntity<List<Link>> getAllLinks() {
        return ResponseEntity.ok(linksService.getAllLinks());
    }


//    {
//        1: {
//        "localUrl": <url>,
//                "remoteUrl": <url>
//    },
//        2: {
//        "localUrl": <url >,
//                "remoteUrl": <url >
//    }

    @GetMapping("/links/status")
    public ResponseEntity<Map<Integer, LinkStatus>> getLinkStatuses(){
        return ResponseEntity.ok(linkMonitorService.checkAllStatuses());
    }


    @PostMapping("/link")
    public ResponseEntity<Link> createLink(@RequestBody Link link) {
        Link created = linksService.createLink(link);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/link/{id}")
    public ResponseEntity<Link> deleteLink(@PathVariable Integer id){
        linksService.deleteLink(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/link/{id}")
    public ResponseEntity<Link> updateLink(@PathVariable Integer id, @RequestBody Link link){
        return ResponseEntity.ok(linksService.updateLink(id, link));
    }

    @PatchMapping("/links/batchmove")
    public ResponseEntity<List<Link>> batchMoveLinks(@RequestBody List<Link> moveRequest){
        return ResponseEntity.ok(reorderService.batchMove(moveRequest));
    }
}
