package com.kiandelamarre.dashboard.service;


import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.repository.LinkRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LinkServiceTest {
    @Mock
    private LinkRepository linkRepository; // Mocks the database/repo layer

    @InjectMocks
    private LinkServiceImpl linkServiceImpl; // Automatically injects the mock repo into your service

    private Link sampleLink;
    private List<Link> testLinks;

    @BeforeEach
    void setUp() {
        sampleLink = new Link();
        sampleLink.setId(1);
        sampleLink.setName("Google");
        sampleLink.setRow(0);
        sampleLink.setColumn(1);
        sampleLink.setLocalUrl("http://google.com");
        sampleLink.setRemoteUrl("https://google.com");


        testLinks = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Link link = new Link();
            link.setId(i);
            link.setName("link " + i);
            link.setRow(i * 10); // Rows: 0, 10, 20, 30
            link.setColumn((i < 5) ? 1 : 2);
            link.setLocalUrl("http://"+i+".com");
            link.setRemoteUrl("https://"+i+".com");  // Put them all in column 1 for predictable testing
            testLinks.add(link);
        }

    }

    @Test
    void testGetAllLinks() {
        // Arrange
        List<Link> mockList = Arrays.asList(sampleLink);
        when(linkRepository.findAll()).thenReturn(mockList);

        // Act
        List<Link> result = linkServiceImpl.getAllLinks();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Google", result.get(0).getName());
        verify(linkRepository, times(1)).findAll(); // Verifies the repo method was actually called
    }

    @Test
    void testCreateLink() {
        // Arrange
        when(linkRepository.insert(sampleLink)).thenReturn(sampleLink);

        // Act
        Link result = linkServiceImpl.createLink(sampleLink);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getId());
        verify(linkRepository, times(1)).insert(sampleLink);
    }

    @Test
    void testCreateLinks() {
        // Arrange
        // Using Mockito.any(Link.class) since it's called in a loop for each element
        when(linkRepository.insert(any(Link.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        List<Link> result = linkServiceImpl.createLink(testLinks);

        // Assert
        assertNotNull(result);
        assertEquals(10, result.size());

        // Verify that the repository's insert method was called exactly 10 times
        verify(linkRepository, times(10)).insert(any(Link.class));
    }

    //Test Url Validation
    @ParameterizedTest
    @ValueSource(strings = {
            "http:/google.com",
            "http://google",
            "dav://google.com"
    })
    void testCreateLink_InvalidUrl_ThrowsException(String invalidUrl) {
        // Arrange
        sampleLink.setLocalUrl(invalidUrl);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> linkServiceImpl.createLink(sampleLink)
        );

        assertEquals(
                "The provided URL '" + invalidUrl + "' is invalid. Please ensure it uses a correct format (e.g., https://example.com).",
                exception.getMessage()
        );
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"  "})
    void testCreateLink_BlankOrNullUrl_NormalizesSuccessfully(String blankUrl) {
        // Arrange
        sampleLink.setLocalUrl(blankUrl);
        when(linkRepository.insert(sampleLink)).thenReturn(sampleLink);


        // Act
        Link result = linkServiceImpl.createLink(sampleLink);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("", result.getLocalUrl());
        verify(linkRepository, times(1)).insert(sampleLink);
    }

    @Test
    void testDeleteLink() {
        // Arrange
        int linkId = 1;
        doNothing().when(linkRepository).delete(linkId);

        // Act
        linkServiceImpl.deleteLink(linkId);

        // Assert
        verify(linkRepository, times(1)).delete(linkId); // Verifies deletion was triggered
    }

    @Test
    void testUpdateLink() {
        // Arrange
        int linkId = 1;
        Link updatedVals = new Link();
        updatedVals.setName("Updated Google");

        when(linkRepository.update(linkId, updatedVals)).thenReturn(updatedVals);

        // Act
        Link result = linkServiceImpl.updateLink(linkId, updatedVals);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Google", result.getName());
        verify(linkRepository, times(1)).update(linkId, updatedVals);
    }


}
