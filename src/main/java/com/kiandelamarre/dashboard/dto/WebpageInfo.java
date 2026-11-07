package com.kiandelamarre.dashboard.dto;

public class WebpageInfo {
    private final String url;
    private final String title;

    public WebpageInfo(String url, String title) {
        this.url = url;
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public String getTitle() {
        return title;
    }
}
