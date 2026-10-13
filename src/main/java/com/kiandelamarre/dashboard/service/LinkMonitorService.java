package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.LinkStatus;

import java.util.Map;

public interface LinkMonitorService {

    Map<Integer, LinkStatus> checkAllStatuses();
}
