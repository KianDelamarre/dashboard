package com.kiandelamarre.dashboard.dto;

public class LinkStatusResponse {

    public enum StatusState {
        ONLINE,
        UNREACHABLE,
        UNDEFINED
    }

    private int linkId;
    private StatusState localStatus;
    private StatusState remoteStatus; // Fixed typo 'remoteStaus'


    public int getLinkId() {
        return linkId;
    }

    public void setLinkId(int linkId) {
        this.linkId = linkId;
    }

    public StatusState getLocalStatus() {
        return localStatus;
    }

    public void setLocalStatus(StatusState localStatus) {
        this.localStatus = localStatus;
    }

    public StatusState getRemoteStatus() {
        return remoteStatus;
    }

    public void setRemoteStatus(StatusState remoteStatus) {
        this.remoteStatus = remoteStatus;
    }

    // Constructors, Getters, Setters
    public LinkStatusResponse(int linkId, StatusState localStatus, StatusState remoteStatus) {
        this.linkId = linkId;
        this.localStatus = localStatus;
        this.remoteStatus = remoteStatus;
    }
}
