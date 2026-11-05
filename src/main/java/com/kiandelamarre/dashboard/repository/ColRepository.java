package com.kiandelamarre.dashboard.repository;

import com.kiandelamarre.dashboard.dto.ColumnDto;

import java.util.List;

 public interface ColRepository {

     List<ColumnDto> findAll();

     ColumnDto findById(int id);

     ColumnDto insert(ColumnDto column) ;

     void delete(int id);

     ColumnDto update(int id, ColumnDto column);

     void saveAll(List<ColumnDto> columns);
    
}
