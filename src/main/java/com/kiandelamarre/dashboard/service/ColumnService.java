package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.ColumnDto;

import java.util.List;

public interface ColumnService {
    List<ColumnDto> getAllColumns();
    ColumnDto createColumn(ColumnDto columnToCreate);
    void deleteColumn(int columnToDeleteId);
    ColumnDto updateColumn (int id, ColumnDto columnWithNewVals);
}
