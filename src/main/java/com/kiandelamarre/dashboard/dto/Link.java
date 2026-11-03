package com.kiandelamarre.dashboard.dto;

import java.util.Objects;

public class Link {
    private int id;
    private String name;
    private String localUrl;
    private String remoteUrl;
    private String imgUrl;
    private int column;
    private int row; //default zero for new vals


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocalUrl() {
        return localUrl;
    }

    public void setLocalUrl(String localUrl) {
        this.localUrl = localUrl;
    }

    public String getRemoteUrl() {
        return remoteUrl;
    }

    public void setRemoteUrl(String remoteUrl) {
        this.remoteUrl = remoteUrl;
    }

    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    public int getColumn() {
        return column;
    }

    public void setColumn(int column) {
        this.column = column;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Link link = (Link) o;
        return id == link.id && column == link.column && row == link.row && Objects.equals(name, link.name) && Objects.equals(localUrl, link.localUrl) && Objects.equals(remoteUrl, link.remoteUrl) && Objects.equals(imgUrl, link.imgUrl);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, localUrl, remoteUrl, imgUrl, column, row);
    }
}
