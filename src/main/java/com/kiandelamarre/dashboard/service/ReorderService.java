package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.dto.MoveRequest;

import java.util.List;

public interface ReorderService {
    public void batchMove(List<MoveRequest> moveRequest);
}
