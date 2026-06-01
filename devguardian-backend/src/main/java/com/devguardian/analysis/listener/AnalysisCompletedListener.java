package com.devguardian.analysis.listener;

import com.devguardian.analysis.events.AnalysisCompletedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AnalysisCompletedListener {

    @EventListener
    public void handleAnalysisCompleted(AnalysisCompletedEvent event) {
        log.info(
            "Analysis {} completed for repository {}",
            event.getAnalysisId(),
            event.getRepositoryId()
        );
    }
}
