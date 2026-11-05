package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.repository.LinkRepository;
import com.kiandelamarre.dashboard.repository.LinkRepository;
import org.springframework.stereotype.Service;

import java.util.List;

 @Service
public class LinkServiceImpl implements LinksService{

     LinkRepository LinkRepository;

     public LinkServiceImpl (LinkRepository LinkRepository){
         this.LinkRepository = LinkRepository;
     }


    @Override
    public List<Link> getAllLinks() {
        return LinkRepository.findAll();

    }

    @Override
    public Link createLink(Link linkToCreate) {
        return LinkRepository.insert(linkToCreate);
    }

     @Override
     public void deleteLink(int linkToDeleteId) {
         LinkRepository.delete(linkToDeleteId);
     }

     @Override
     public Link updateLink(int linkToUpdateId, Link linkWithNewVals) {

         return LinkRepository.update(linkToUpdateId, linkWithNewVals);
     }

     @Override
     public void saveAll(List<Link> newLinks) {
         LinkRepository.saveAll(newLinks);
     }

 }
