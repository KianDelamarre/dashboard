package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.LinkStatusResponse;

import java.util.List;
import java.util.Map;

public interface LinkMonitorService {

    Map<Integer,LinkStatusResponse> checkAllStatuses();
}
