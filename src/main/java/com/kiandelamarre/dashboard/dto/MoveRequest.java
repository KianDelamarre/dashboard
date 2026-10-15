package com.kiandelamarre.dashboard.dto;

public class moveRequest {
    int idToMove;
    int relativeToId;
    int targetColumn;

    public int getIdToMove() {
        return idToMove;
    }

    public void setIdToMove(int idToMove) {
        this.idToMove = idToMove;
    }

    public int getRelativeToId() {
        return relativeToId;
    }

    public void setRelativeToId(int relativeToId) {
        this.relativeToId = relativeToId;
    }

    public int getTargetColumn() {
        return targetColumn;
    }

    public void setTargetColumn(int targetColumn) {
        this.targetColumn = targetColumn;
    }
}
