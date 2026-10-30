package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.dto.MoveRequest;
import com.kiandelamarre.dashboard.repository.LinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReorderServiceImpl implements ReorderService {

    private final LinkRepository linkRepository;

    public ReorderServiceImpl(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    @Override
    @Transactional
    public List<Link> batchMove(List<MoveRequest> moveRequests) {
        if (moveRequests == null || moveRequests.isEmpty()) {
            throw new IllegalArgumentException("Invalid input: moveRequests cannot be null or empty");
        }

        // 1. Local variable scoped strictly to this request thread
        List<Link> allLinks = linkRepository.findAll();

        try {
            for (MoveRequest move : moveRequests) {
                int idToMove = move.getIdToMove();
                int relativeToId = move.getRelativeToId();
                int targetColumn = move.getTargetColumn();

                System.out.println("\n\nmoveRequests = " +
                        "\nid: "+ idToMove+ " " +
                        "\nrelativeToId: "+ relativeToId + " "+
                        "\ntargetColumn: "+ targetColumn);

                moveIdToPositionAndReindex(allLinks, idToMove, relativeToId, targetColumn);
            }

            // 2. Save the local list
            linkRepository.saveAll(allLinks);

            // 3. Return fresh data from DB
            return linkRepository.findAll();
        } catch (Exception err) {
            throw new RuntimeException("Batch move failed: " + err.getMessage(), err);
        }
    }

    private void moveIdToPositionAndReindex(List<Link> allLinks, int idToMove, int relativeToId, int targetColumn) {
        int rowToInsertAt;

        if (relativeToId == 0) {
            int lastRowNumber = getLastRowInColumn(allLinks, targetColumn);
            rowToInsertAt = lastRowNumber + 10;
            moveIdToPosition(allLinks, idToMove, rowToInsertAt, targetColumn);
            return;
        }

        Link relativeLink = findById(allLinks, relativeToId);
        int effectiveTargetColumn = targetColumn != 0 ? targetColumn : relativeLink.getColumn();
        int relativeToIdRow = relativeLink.getRow();

        int prevRow = getPrevRow(allLinks, effectiveTargetColumn, relativeToIdRow);

        if (Math.abs(relativeToIdRow - prevRow) < 2) {
            reIndexRowsForColumn(allLinks, effectiveTargetColumn);
            moveIdToPositionAndReindex(allLinks, idToMove, relativeToId, effectiveTargetColumn);
            return;
        }

        rowToInsertAt = (relativeToIdRow + prevRow) / 2;
        moveIdToPosition(allLinks, idToMove, rowToInsertAt, effectiveTargetColumn);
    }

    private void reIndexRowsForColumn(List<Link> allLinks, int column) {
        List<Link> rowsToReindex = findByColumnOrderByRowAsc(allLinks, column);
        int rowNum = 10;
        for (Link link : rowsToReindex) {
            link.setRow(rowNum);
            updateRowAndCol(allLinks, link);
            rowNum += 10;
        }
    }

    private int getPrevRow(List<Link> allLinks, int column, int originalRow) {
        int prevRow = 0;
        for (Link link : allLinks) {
            if (link.getRow() >= originalRow) {
                break;
            }
            if (link.getColumn() == column) {
                prevRow = link.getRow();
            }
        }
        return prevRow;
    }

    private int getLastRowInColumn(List<Link> allLinks, int column) {
        return allLinks.stream()
                .filter(link -> link.getColumn() == column)
                .mapToInt(Link::getRow)
                .max()
                .orElse(0);
    }

    private void moveIdToPosition(List<Link> allLinks, int idToMove, int rowToInsertAt, int targetColumn) {
        Link link = findById(allLinks, idToMove);
        link.setRow(rowToInsertAt);
        link.setColumn(targetColumn);
        updateRowAndCol(allLinks, link);
    }

    private void updateRowAndCol(List<Link> allLinks, Link updatedLink) {
        for (int i = 0; i < allLinks.size(); i++) {
            if (allLinks.get(i).getId() == updatedLink.getId()) {
                allLinks.set(i, updatedLink);
                break;
            }
        }
    }

    private Link findById(List<Link> allLinks, int id){
        return allLinks.stream()
                .filter(link -> link.getId() == id)
                .findFirst()
                .orElse(null);
    }

    private List<Link> findByColumnOrderByRowAsc(List<Link> allLinks, int column){
        return allLinks.stream()
                .filter(link -> link.getColumn() == column)
                .toList();
    }
}