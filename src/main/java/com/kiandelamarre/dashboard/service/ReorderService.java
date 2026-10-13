package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;

import java.util.List;

public interface ReorderService {
    public List<Link> batchMove(List<Link> moveRequest);
}
