package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.repository.LinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

 @Service
public class LinkServiceImpl implements LinksService{

     LinkRepository linkRepository;

     public LinkServiceImpl (LinkRepository linkRepository){
         this.linkRepository = linkRepository;
     }


    @Override
    public List<Link> getAllLinks() {
        return linkRepository.findAll();

    }

    @Override
    public Link createLink(Link linkToCreate) {
        return linkRepository.insert(linkToCreate);
    }

     @Override
     public void deleteLink(int linkToDeleteId) {
         linkRepository.delete(linkToDeleteId);
     }

     @Override
     public Link updateLink(int linkToUpdateId, Link linkWithNewVals) {

         return linkRepository.update(linkToUpdateId, linkWithNewVals);
     }

}
