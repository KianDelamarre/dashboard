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
         linkToCreate.setRemoteUrl(validateUrl(linkToCreate.getRemoteUrl()));
         linkToCreate.setLocalUrl(validateUrl(linkToCreate.getLocalUrl()));


        return LinkRepository.insert(linkToCreate);
    }

     @Override
     public void deleteLink(int linkToDeleteId) {
         LinkRepository.delete(linkToDeleteId);
     }

     @Override
     public Link updateLink(int linkToUpdateId, Link linkWithNewVals) {
         linkWithNewVals.setRemoteUrl(validateUrl(linkWithNewVals.getRemoteUrl()));
         linkWithNewVals.setLocalUrl(validateUrl(linkWithNewVals.getLocalUrl()));

         return LinkRepository.update(linkToUpdateId, linkWithNewVals);
     }

     @Override
     public void saveAll(List<Link> newLinks) {
         LinkRepository.saveAll(newLinks);
     }

     private String validateUrl(String url){

         if(url == null || url.strip().isEmpty()) return "";


         String trimmedUrl = url.trim();
         String invalidUrlMsg = "The provided URL '" + trimmedUrl + "' is invalid. Please ensure it uses a correct format (e.g., https://example.com).";

         if(!(trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://"))){
             throw new IllegalArgumentException(invalidUrlMsg);
         }

         try {
             java.net.URI uri = java.net.URI.create(trimmedUrl);

             // Ensure a valid host exists and contains a dot (e.g., "google.com")
             if (uri.getHost() == null || !uri.getHost().contains(".")) {
                 throw new IllegalArgumentException(invalidUrlMsg);
             }

             return trimmedUrl;
         } catch (IllegalArgumentException e) {
             throw new IllegalArgumentException(invalidUrlMsg);
         }
     }
 }
