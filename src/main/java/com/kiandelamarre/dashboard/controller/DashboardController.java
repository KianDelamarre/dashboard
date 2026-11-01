package com.kiandelamarre.dashboard.controller;

import com.kiandelamarre.dashboard.dto.*;
import com.kiandelamarre.dashboard.service.ColumnService;
import com.kiandelamarre.dashboard.service.LinkMonitorService;
import com.kiandelamarre.dashboard.service.LinksService;
import com.kiandelamarre.dashboard.service.ReorderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final LinksService linksService;
    private final ColumnService columnService;
    private final ReorderService reorderService;
    private final LinkMonitorService linkMonitorService;

    public DashboardController(LinksService linksService, ColumnService columnService, ReorderService reorderService, LinkMonitorService linkMonitorService) {
        this.linksService = linksService;
        this.columnService = columnService;
        this.reorderService = reorderService;
        this.linkMonitorService = linkMonitorService;

    }

    //returns a list of links and a list of columns
//    @GetMapping("/api/links")
//    public ResponseEntity<List<Link>> getAllLinks() {
//        return ResponseEntity.ok(linksService.getAllLinks());
//    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDataResponse> getDashboardData() {
        List<ColumnDto> columns = columnService.getAllColumns();
        List<Link> links = linksService.getAllLinks();

        return ResponseEntity.ok(new DashboardDataResponse(columns, links));
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
    public ResponseEntity<List<Link>> batchMoveLinks(@RequestBody List<MoveRequest> batchMoveRequest){
        return ResponseEntity.ok(reorderService.batchMove(batchMoveRequest));
    }

    @PatchMapping("/links/batchsave")
    public ResponseEntity<Void> batchMoveLinks(@RequestBody DashboardChanges dashboardChangeRequest) {
        reorderService.batchMove(dashboardChangeRequest.getMoveRequestList());
        columnService.batchUpdate(dashboardChangeRequest.getColumnDtoList());

        return ResponseEntity.ok().build();
    }


    @PostMapping("/column")
    public ResponseEntity<ColumnDto> createColumn(@RequestBody ColumnDto column){
        return ResponseEntity.ok(columnService.createColumn(column));
    }

    @PatchMapping("/column/{id}")
    public ResponseEntity<ColumnDto> updateColumn(@PathVariable Integer id, @RequestBody ColumnDto column){
        return ResponseEntity.ok(columnService.updateColumn(id, column));
    }

    @DeleteMapping("/column/{id}")
    public ResponseEntity<ColumnDto> deleteColumn(@PathVariable Integer id){
        columnService.deleteColumn(id);
        return ResponseEntity.noContent().build();
    }
}
