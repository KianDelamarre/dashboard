package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import org.springframework.stereotype.Service;

import java.util.List;

 @Service
public class LinkServiceImpl implements LinksService{
    @Override
    public List<Link> getAllLinks() {
        return List.of();
    }

    @Override
    public Link createLink(Link linkToCreate) {
        return null;
    }

     @Override
     public void deleteLink(int linkToDeleteId) {
     }

     @Override
     public Link updateLink(int LinkToUpdateId, Link linkWithNewVals) {
         return null;
     }

}
