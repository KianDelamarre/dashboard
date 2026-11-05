package com.kiandelamarre.dashboard.repository;

import com.kiandelamarre.dashboard.dto.Link;
import java.util.List;

 public interface LinkRepository {
     List<Link> findAll();

     Link findById(int id);

     Link insert(Link link);

     void delete(int id);

     Link update(int id, Link link);

     Link updateRowAndCol(Link link);


     void saveAll(List<Link> links) ;
}
