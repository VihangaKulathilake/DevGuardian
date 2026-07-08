package com.devguardian.analysis.consumer;

import com.devguardian.analysis.events.AnalysisStartedEvent;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import com.devguardian.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisStartedConsumer {

    private final AnalysisService analysisService;

    @RabbitListener(queues = RabbitMQConfig.ANALYSIS_STARTED_QUEUE)
    public void handleAnalysisStarted(AnalysisStartedEvent event) {
        log.info("Received AnalysisStartedEvent from RabbitMQ for analysis ID: {}", event.getAnalysisId());

        com.devguardian.config.FeignClientInterceptor.setToken(event.getToken());
        try {
            analysisService.executeAnalysis(event.getAnalysisId());
        } finally {
            com.devguardian.config.FeignClientInterceptor.clearToken();
        }
    }
}
