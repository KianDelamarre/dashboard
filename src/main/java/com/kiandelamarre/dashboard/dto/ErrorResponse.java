package com.kiandelamarre.dashboard.dto;

public record ErrorResponse(
        int status,
        String message,
        long timestamp
) {}
