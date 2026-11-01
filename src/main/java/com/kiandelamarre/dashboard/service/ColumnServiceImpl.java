package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.ColumnDto;
import com.kiandelamarre.dashboard.repository.ColRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
