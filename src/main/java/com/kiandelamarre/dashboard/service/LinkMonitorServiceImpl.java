package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.LinkStatus;
import com.kiandelamarre.dashboard.dto.LinkStatusResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class LinkMonitorServiceImpl implements LinkMonitorService {
    @Override
    public List<LinkStatusResponse> checkAllStatuses() {
        return List.of();
    }
}
