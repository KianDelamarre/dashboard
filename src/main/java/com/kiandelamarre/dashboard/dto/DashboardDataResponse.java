package com.kiandelamarre.dashboard.dto;

import java.util.List;

public class DashboardDataResponse {
    private List<ColumnDto> columns;
    private List<Link> links;

    public DashboardDataResponse(List<ColumnDto> columns, List<Link> links) {
        this.columns = columns;
        this.links = links;
    }

    // Getters and Setters
    public List<ColumnDto> getColumns() { return columns; }
    public void setColumns(List<ColumnDto> columns) { this.columns = columns; }

    public List<Link> getLinks() { return links; }
    public void setLinks(List<Link> links) { this.links = links; }
}
