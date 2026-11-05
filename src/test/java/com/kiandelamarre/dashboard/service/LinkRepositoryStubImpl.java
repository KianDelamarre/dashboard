package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.repository.LinkRepository;

import java.util.ArrayList;
import java.util.List;

public class LinkRepositoryStubImpl implements LinkRepository {

    private List<Link> allLinks = new ArrayList<>();

    LinkRepositoryStubImpl(){
        generateLinks();
    }

    private void generateLinks(){
        for(int i =0; i<10; i++){
            Link link = new Link();
            link.setId(i);
            link.setName("link "+i);
            link.setRow(i);
            link.setColumn((i % 2 == 0) ? 2 : 1);
            link.setLocalUrl("http://"+i);
            link.setRemoteUrl("https://"+i);

            allLinks.add(link);
        }
    }

    @Override
    public List<Link> findAll() {
        return allLinks;
    }

    @Override
    public Link findById(int id) {
        return allLinks.stream()
                .filter(link -> link.getId() == id)
                .findFirst()
                .orElse(null);
    }

    @Override
    public Link insert(Link link) {
        allLinks.add(link);
        return link;
    }

    @Override
    public void delete(int id) {
        Link link = findById(id);
        if(link != null){
            allLinks.remove(link);
        }

    }

    @Override
    public Link update(int id, Link newLink) {
        // Find the existing link using your findById method
        Link foundLink = findById(id);

        if (foundLink != null) {
            // Find the index of the old link in your list
            int index = allLinks.indexOf(foundLink);

            if (index != -1) {
                // Replace the old link with the new one at that exact index
                allLinks.set(index, newLink);
                return newLink; // Return the updated link
            }
        }

        return null; // Return null or throw an exception if the ID wasn't found
    }

    @Override
    public Link updateRowAndCol(Link link) {
        Link foundLink = findById(link.getId());
        if (foundLink != null) {
            foundLink.setRow(link.getRow());
            foundLink.setColumn(link.getColumn());
            return foundLink;
        }
        return null;
    }
    @Override
    public void saveAll(List<Link> links) {
        for(Link link : links){
            Link existing = findById(link.getId());
            if (existing != null) {
                update(link.getId(), link);
            } else {
                insert(link);
            }
        }
    }
}
