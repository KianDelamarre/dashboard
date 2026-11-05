package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.ColumnDto;
import com.kiandelamarre.dashboard.repository.ColRepositorySqliteImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ColumnServiceImpl implements ColumnService{

    ColRepositorySqliteImpl colRepositorySqliteImpl;

    public ColumnServiceImpl(ColRepositorySqliteImpl colRepositorySqliteImpl) {
        this.colRepositorySqliteImpl = colRepositorySqliteImpl;
    }


    @Override
    public List<ColumnDto> getAllColumns() {
        return colRepositorySqliteImpl.findAll();
    }

    @Override
    public ColumnDto createColumn(ColumnDto columnToCreate) {
        return colRepositorySqliteImpl.insert(columnToCreate);
    }

    @Override
    public void deleteColumn(int columnToDeleteId) {
        colRepositorySqliteImpl.delete(columnToDeleteId);
    }

    @Override
    public ColumnDto updateColumn(int id, ColumnDto columnWithNewVals) {
        return colRepositorySqliteImpl.update(id, columnWithNewVals);
    }

    @Override
    @Transactional
    public List<ColumnDto> batchUpdate(List<ColumnDto> updateRequest) {
        if (updateRequest == null || updateRequest.isEmpty()) {
            return colRepositorySqliteImpl.findAll(); //just return the empty list
        }

        // 1. Fetch all existing columns from the database (since there are only a few)
        List<ColumnDto> allEntities = colRepositorySqliteImpl.findAll();

        // 2. Create a lookup map from the incoming DTOs for fast access
        Map<Integer, ColumnDto> updateMap = updateRequest.stream()
                .collect(Collectors.toMap(ColumnDto::getId, dto -> dto));

        // 3. Update fields on the database entities if they are present in the update request
        for (ColumnDto entity : allEntities) {
            ColumnDto dto = updateMap.get(entity.getId());
            if (dto != null) {
                entity.setName(dto.getName());
                // entity.setDisplayOrder(dto.getDisplayOrder()); // Uncomment if you update display order too
            }
        }

        // 4. Save all managed entities back to the database
        colRepositorySqliteImpl.saveAll(allEntities);

        return allEntities;
    }
}
