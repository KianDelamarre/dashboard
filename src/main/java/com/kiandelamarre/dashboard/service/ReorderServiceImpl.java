package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReorderServiceImpl implements ReorderService {

    @Override
    public List<Link> batchMove(List<Link> moveRequest) {
        return List.of();
    }
}
