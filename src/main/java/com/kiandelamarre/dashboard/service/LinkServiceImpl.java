package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.ColumnDto;
import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.repository.ColRepository;
import com.kiandelamarre.dashboard.repository.LinkRepository;
import com.kiandelamarre.dashboard.repository.LinkRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

 @Service
public class LinkServiceImpl implements LinksService{

     ColRepository colRepository;
     LinkRepository LinkRepository;

     public LinkServiceImpl (LinkRepository LinkRepository, ColRepository colRepository){
         this.LinkRepository = LinkRepository;
         this.colRepository = colRepository;
     }


    @Override
    public List<Link> getAllLinks() {
        return LinkRepository.findAll();

    }

    @Override
    public Link createLink(Link linkToCreate) {
         validateLink(linkToCreate);
        return LinkRepository.insert(linkToCreate);
    }

     @Override
     public List<Link> createLink(List<Link> linksToCreate) {
         List<Link> allLinks = new ArrayList<>();
         for(Link link : linksToCreate){
             link = validateLink(link);
             allLinks.add(createLink(link));
         }
         return allLinks;
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

     private Link validateLink(Link link){
         link.setRemoteUrl(validateUrl(link.getRemoteUrl()));
         link.setLocalUrl(validateUrl(link.getLocalUrl()));
         link.setColumn(validateColumn(link.getColumn()));
         calcNewRow(link.getColumn());

         return link;
     }

     private int validateColumn(int columnId) {
         ColumnDto col = colRepository.findById(columnId);

         if (col == null) {
             return 1;
         }

         return columnId;
     }
     
     private int calcNewRow(int column){
         return LinkRepository.findMaxRowInColumn(column) +10;
     }
 }
