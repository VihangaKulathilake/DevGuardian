package com.devguardian.ai.listener;

import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.ai.service.interfaces.AiAnalysisService;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.events.IssueCreatedEvent;
import com.devguardian.analysis.repository.IssueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class IssueAiEnrichmentListenerTests {

    @Mock
    private AiAnalysisService aiAnalysisService;

    @Mock
    private IssueRepository issueRepository;

    @InjectMocks
    private IssueAiEnrichmentListener listener;

    private Issue testIssue;

    @BeforeEach
    public void setUp() {
        testIssue = new Issue();
        testIssue.setId(1L);
        testIssue.setType("WEAK_JWT_SECRET");
        testIssue.setFileName("application.properties");
        testIssue.setCodeSnippet("jwt.secret=secret");
        testIssue.setDescription("Weak JWT secret");
    }

    @Test
    public void testHandleIssueCreated_Success() {
        // Given
        IssueCreatedEvent event = new IssueCreatedEvent(testIssue);
        
        AiIssueResponse mockAiResponse = new AiIssueResponse();
        mockAiResponse.setExplanation("This is an explanation.");
        mockAiResponse.setImpact("This is an impact.");
        mockAiResponse.setRecommendation("This is a recommendation.");
        mockAiResponse.setModelName("llama-3.1-8b-instant");

        when(issueRepository.findById(1L)).thenReturn(Optional.of(testIssue));
        when(aiAnalysisService.analyze(any(AiIssueRequest.class))).thenReturn(mockAiResponse);

        // When
        listener.handleIssueCreated(event);

        // Then
        verify(issueRepository).findById(1L);
        
        ArgumentCaptor<AiIssueRequest> requestCaptor = ArgumentCaptor.forClass(AiIssueRequest.class);
        verify(aiAnalysisService).analyze(requestCaptor.capture());
        
        AiIssueRequest capturedRequest = requestCaptor.getValue();
        assertEquals("WEAK_JWT_SECRET", capturedRequest.getIssueType());
        assertEquals("application.properties", capturedRequest.getFileName());
        assertEquals("jwt.secret=secret", capturedRequest.getCodeSnippet());
        assertEquals("Weak JWT secret", capturedRequest.getDescription());

        ArgumentCaptor<Issue> issueCaptor = ArgumentCaptor.forClass(Issue.class);
        verify(issueRepository).save(issueCaptor.capture());
        
        Issue savedIssue = issueCaptor.getValue();
        assertEquals("This is an explanation.", savedIssue.getAiExplanation());
        assertEquals("This is an impact.", savedIssue.getAiImpact());
        assertEquals("This is a recommendation.", savedIssue.getAiRecommendation());
        assertEquals("llama-3.1-8b-instant", savedIssue.getAiModel());
        assertNotNull(savedIssue.getAiGeneratedAt());
    }

    @Test
    public void testHandleIssueCreated_IssueNotFound() {
        // Given
        IssueCreatedEvent event = new IssueCreatedEvent(testIssue);
        when(issueRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        listener.handleIssueCreated(event);

        // Then
        verify(issueRepository).findById(1L);
        verifyNoInteractions(aiAnalysisService);
        verify(issueRepository, never()).save(any(Issue.class));
    }
}
