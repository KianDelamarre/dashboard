package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.dto.MoveRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReorderServiceTest {

    @Mock
    private LinksService linksService; // Mock the boundary service

    @InjectMocks
    private ReorderServiceImpl reorderService; // The real logic you want to test!

    private List<Link> testLinks;

    @BeforeEach
    void setUp() {
        // Generate a fresh set of mock data before each test
        // (similar to your stub's generateLinks logic)
        testLinks = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Link link = new Link();
            link.setId(i);
            link.setName("link " + i);
            link.setRow(i * 10); // Rows: 0, 10, 20, 30
            link.setColumn((i > 5) ? 2 : 1);
            link.setLocalUrl("http://"+i);
            link.setRemoteUrl("https://"+i);  // Put them all in column 1 for predictable testing
            testLinks.add(link);
        }

    }

    @Test
    void testBatchMove_MultipleRequests_VerifiesFinalOrder() {
        // Arrange
        when(linksService.getAllLinks()).thenReturn(testLinks);

        // Build multiple move requests
        MoveRequest move1 = new MoveRequest();
        move1.setIdToMove(3);
        move1.setRelativeToId(1);
        move1.setTargetColumn(1);

        MoveRequest move2 = new MoveRequest();
        move2.setIdToMove(7);
        move2.setRelativeToId(2);
        move2.setTargetColumn(2);

        MoveRequest move3 = new MoveRequest();
        move3.setIdToMove(5);
        move3.setRelativeToId(0); // Appending/moving to end of a column or root handling
        move3.setTargetColumn(1);

        List<MoveRequest> requests = List.of(move1, move2, move3);

        // Act
        List<Link> result = reorderService.batchMove(requests);

        // Assert
        assertNotNull(result);
        verify(linksService, times(1)).saveAll(anyList());

        // Sort the resulting list by Column first, then by Row (just like your app layout)
        List<Link> sortedLinks = result.stream()
                .sorted(java.util.Comparator.comparingInt(Link::getColumn)
                        .thenComparingInt(Link::getRow))
                .toList();

        // Extract just the IDs in their new visual order
        List<Integer> actualIdOrder = sortedLinks.stream()
                .map(Link::getId)
                .toList();

        // Assert the exact expected order of link IDs
        // (Example: adjust this expected list based on how your math places items 3 and 7)
        List<Integer> expectedIdOrder = List.of(0,3,1,7,2,4,5,6,8,9);

        assertEquals(expectedIdOrder, actualIdOrder);
    }

}
