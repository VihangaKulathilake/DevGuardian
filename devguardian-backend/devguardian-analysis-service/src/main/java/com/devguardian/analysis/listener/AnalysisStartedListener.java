package com.devguardian.analysis.listener;

import com.devguardian.analysis.events.AnalysisStartedEvent;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisStartedListener {

    private final AnalysisService analysisService;

    @Async
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleAnalysisStarted(
            AnalysisStartedEvent event
    ) {

        log.info(
                "Analysis started: {}",
                event.getAnalysisId()
        );

        com.devguardian.config.FeignClientInterceptor.setToken(event.getToken());
        try {
            analysisService.executeAnalysis(
                    event.getAnalysisId()
            );
        } finally {
            com.devguardian.config.FeignClientInterceptor.clearToken();
        }
    }
}
