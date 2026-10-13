package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;

import java.util.List;

public interface LinksService {

    List<Link> getAllLinks();
    Link createLink(Link linkToCreate);
    Link deleteLink(int linkToDeleteId);
    Link updateLink (int LinkToUpdateId, Link linkWithNewVals);

}
