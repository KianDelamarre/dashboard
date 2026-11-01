package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.ColumnDto;
import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.dto.MoveRequest;
import com.kiandelamarre.dashboard.repository.ColRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ColumnServiceImpl implements ColumnService{

    ColRepository colRepository;

    public ColumnServiceImpl(ColRepository colRepository) {
        this.colRepository = colRepository;
    }


    @Override
    public List<ColumnDto> getAllColumns() {
        return colRepository.findAll();
    }

    @Override
    public ColumnDto createColumn(ColumnDto columnToCreate) {
        return colRepository.insert(columnToCreate);
    }

    @Override
    public void deleteColumn(int columnToDeleteId) {
        colRepository.delete(columnToDeleteId);
    }

    @Override
    public ColumnDto updateColumn(int id, ColumnDto columnWithNewVals) {
        return colRepository.update(id, columnWithNewVals);
    }

    @Override
    @Transactional
    public List<ColumnDto> batchUpdate(List<ColumnDto> updateRequest) {
        if (updateRequest == null || updateRequest.isEmpty()) {
            throw new IllegalArgumentException("Invalid input: updateRequest cannot be null or empty");
        }

        List<ColumnDto> allColumns = colRepository.findAll();

        // Collect all existing IDs from the database into a Set for fast lookup
        Set<Object> existingIds = allColumns.stream()
                .map(ColumnDto::getId)
                .collect(Collectors.toSet());

        // Find any IDs in updateRequest that do NOT exist in the database
        List<Object> missingIds = updateRequest.stream()
                .map(ColumnDto::getId)
                .filter(id -> !existingIds.contains(id))
                .collect(Collectors.toList());

        // Throw an exception if there are any invalid/non-existent IDs
        if (!missingIds.isEmpty()) {
            throw new IllegalArgumentException("Batch update failed. The following IDs do not exist: " + missingIds);
        }

        // Create a Set of update IDs to filter allColumns
        Set<Object> updateIds = updateRequest.stream()
                .map(ColumnDto::getId)
                .collect(Collectors.toSet());

        // Filter allColumns to only keep the matched ones
        List<ColumnDto> filteredColumns = allColumns.stream()
                .filter(col -> updateIds.contains(col.getId()))
                .collect(Collectors.toList());

        colRepository.saveAll(filteredColumns);

        return filteredColumns;

    }
}
