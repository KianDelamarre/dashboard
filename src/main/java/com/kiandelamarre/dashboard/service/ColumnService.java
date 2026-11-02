package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.ColumnDto;
import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.dto.MoveRequest;

import java.util.List;

public interface ColumnService {
    List<ColumnDto> getAllColumns();
    ColumnDto createColumn(ColumnDto columnToCreate);
    void deleteColumn(int columnToDeleteId);
    ColumnDto updateColumn (int id, ColumnDto columnWithNewVals);
    public void batchUpdate(List<ColumnDto> updateRequest);
}
