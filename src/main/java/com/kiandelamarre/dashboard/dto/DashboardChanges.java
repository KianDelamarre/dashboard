package com.kiandelamarre.dashboard.dto;

import java.util.List;

public class DashboardChanges {
    private List<MoveRequest> moveRequestList;
    private List<ColumnDto> columnDtoList;

    public List<MoveRequest> getMoveRequestList() {
        return moveRequestList;
    }

    public void setMoveRequestList(List<MoveRequest> moveRequestList) {
        this.moveRequestList = moveRequestList;
    }

    public List<ColumnDto> getColumnDtoList() {
        return columnDtoList;
    }

    public void setColumnDtoList(List<ColumnDto> columnDtoList) {
        this.columnDtoList = columnDtoList;
    }
}
