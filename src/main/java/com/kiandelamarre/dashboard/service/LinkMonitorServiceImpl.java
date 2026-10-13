package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.LinkStatus;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class LinkMonitorServiceImpl implements LinkMonitorService {
    @Override
    public Map<Integer, LinkStatus> checkAllStatuses() {
        return Map.of();
    }
}
