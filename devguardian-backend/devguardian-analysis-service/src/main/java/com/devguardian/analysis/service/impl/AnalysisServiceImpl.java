package com.devguardian.analysis.service.impl;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.entity.AnalysisReport;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.AnalysisStatus;
import com.devguardian.analysis.enums.ReportFormat;
import com.devguardian.analysis.enums.ReportType;
import com.devguardian.analysis.events.AnalysisCompletedEvent;
import com.devguardian.analysis.events.AnalysisStartedEvent;
import com.devguardian.analysis.events.IssueCreatedEvent;
import com.devguardian.analysis.report.interfaces.ReportGenerator;
import com.devguardian.analysis.report.model.AnalysisReportSummary;
import com.devguardian.analysis.repository.AnalysisReportRepository;
import com.devguardian.analysis.repository.AnalysisRepository;
import com.devguardian.analysis.repository.IssueRepository;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.engine.RuleEngine;
import com.devguardian.analysis.scanner.impl.GitRepositoryScanner;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.analysis.scoring.interfaces.ScoreCalculator;
import com.devguardian.analysis.scoring.model.ScoreResult;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import com.devguardian.analysis.util.AnalysisAccessValidator;
import com.devguardian.client.RepositoryClient;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AnalysisServiceImpl implements AnalysisService {

        private final RepositoryClient repositoryClient;
        private final AnalysisRepository analysisRepository;
        private final IssueRepository issueRepository;

        private final RepositoryScanner mockRepositoryScanner;
        private final GitRepositoryScanner gitRepositoryScanner;
        private final RuleEngine ruleEngine;

        private final ScoreCalculator scoreCalculator;

        private final ReportGenerator reportGenerator;
        private final AnalysisReportRepository analysisReportRepository;

        private final ApplicationEventPublisher eventPublisher;
        private final RabbitTemplate rabbitTemplate;

        private final AnalysisAccessValidator analysisAccessValidator;
        private final CurrentUserUtil currentUserUtil;

        @Override
        @Transactional
        public Analysis startAnalysis(Long repositoryId) {

            RepositoryResponse repository = repositoryClient.getRepository(repositoryId);
            if (repository == null) {
                throw new ResourceNotFoundException("Repository not found");
            }

            if (!repository.getUserId().equals(currentUserUtil.getCurrentUser().getId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You do not have permission to access this repository"
                );
            }

            /*
             * Create RUNNING analysis
             */
            Analysis analysis =
                    analysisRepository.save(
                            Analysis.builder()
                                    .repositoryId(repositoryId)
                                    .status(AnalysisStatus.RUNNING)
                                    .startedAt(LocalDateTime.now())
                                    .build()
                    );
            analysisRepository.flush();

            /*
             * Publish event after database transaction commits
             */
            String token = null;
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                token = attributes.getRequest().getHeader("Authorization");
            }

            final Long analysisId = analysis.getId();
            final String finalToken = token;

            if (org.springframework.transaction.support.TransactionSynchronizationManager.isSynchronizationActive()) {
                org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                        new org.springframework.transaction.support.TransactionSynchronization() {
                            @Override
                            public void afterCommit() {
                                rabbitTemplate.convertAndSend(
                                        com.devguardian.config.RabbitMQConfig.EXCHANGE_NAME,
                                        com.devguardian.config.RabbitMQConfig.ANALYSIS_STARTED_ROUTING_KEY,
                                        new AnalysisStartedEvent(
                                                analysisId,
                                                repositoryId,
                                                finalToken
                                        )
                                );
                            }
                        }
                );
            } else {
                rabbitTemplate.convertAndSend(
                        com.devguardian.config.RabbitMQConfig.EXCHANGE_NAME,
                        com.devguardian.config.RabbitMQConfig.ANALYSIS_STARTED_ROUTING_KEY,
                        new AnalysisStartedEvent(
                                analysisId,
                                repositoryId,
                                finalToken
                        )
                );
            }

            return analysis;
        }

        @Override
        @Transactional
        public void executeAnalysis(Long analysisId) {

            Analysis analysis = null;
            for (int i = 0; i < 5; i++) {
                var found = analysisRepository.findById(analysisId);
                if (found.isPresent()) {
                    analysis = found.get();
                    break;
                }
                try {
                    Thread.sleep(150);
                } catch (InterruptedException ignored) {}
            }

            if (analysis == null) {
                throw new ResourceNotFoundException("Analysis not found for ID: " + analysisId);
            }

            try {

                RepositoryResponse repository = repositoryClient.getRepository(analysis.getRepositoryId());

                /*
                 * STEP 0
                 * Ensure repository files exist before scanning
                 */
                if (repository.getProvider() != com.devguardian.repository.enums.RepositoryProvider.LOCAL) {
                    try {
                        repositoryClient.cloneRepository(repository.getId());
                    } catch (Exception e) {
                        log.warn("Clone check during executeAnalysis for repo ID {} resulted in: {}", repository.getId(), e.getMessage());
                    }
                }

                /*
                 * STEP 1
                 * Scan repository files
                 */
                ScanContext context =
                        gitRepositoryScanner.scan(repository);

                /*
                 * STEP 2
                 * Run rule engine
                 */
                List<Issue> issues =
                        ruleEngine.runAllRules(context);

                /*
                 * STEP 3
                 * Attach analysis and real code snippets to issues
                 */
                final Analysis targetAnalysis = analysis;
                issues.forEach(issue -> {
                    issue.setAnalysis(targetAnalysis);
                    if (issue.getCodeSnippet() == null || issue.getCodeSnippet().isBlank()) {
                        String fileContent = context.getFiles().get(issue.getFilePath());
                        if (fileContent != null && issue.getLineNumber() != null) {
                            String[] lines = fileContent.split("\n");
                            int lineIdx = issue.getLineNumber() - 1;
                            if (lineIdx >= 0 && lineIdx < lines.length) {
                                issue.setCodeSnippet(lines[lineIdx].trim());
                            }
                        }
                    }
                });

                analysis.getIssues().addAll(issues);

                /*
                 * STEP 4
                 * Save issues
                 */
                List<Issue> savedIssues = issueRepository.saveAll(issues);

                /*
                 * STEP 4.5
                 * Publish issue created events for AI enrichment
                 */
                savedIssues.forEach(issue ->
                        rabbitTemplate.convertAndSend(
                                com.devguardian.config.RabbitMQConfig.EXCHANGE_NAME,
                                com.devguardian.config.RabbitMQConfig.ISSUE_CREATED_ROUTING_KEY,
                                new IssueCreatedEvent(issue.getId())
                        ));

                /*
                 * STEP 5
                 * Calculate scores
                 */
                ScoreResult scoreResult =
                        scoreCalculator.calculateScores(issues);

                analysis.setSecurityScore(
                        scoreResult.getSecurityScore());

                analysis.setQualityScore(
                        scoreResult.getQualityScore());

                analysis.setArchitectureScore(
                        scoreResult.getArchitectureScore());

                /*
                 * STEP 6
                 * Generate report summary
                 */
                AnalysisReportSummary summary =
                        reportGenerator.generate(analysis);

                /*
                 * STEP 7
                 * Build report JSON
                 */
                String reportData = """
                    {
                      "totalIssues": %d,
                      "criticalIssues": %d,
                      "highIssues": %d,
                      "mediumIssues": %d,
                      "lowIssues": %d,
                      "securityScore": %d,
                      "qualityScore": %d,
                      "architectureScore": %d
                    }
                    """.formatted(
                        summary.getTotalIssues(),
                        summary.getCriticalIssues(),
                        summary.getHighIssues(),
                        summary.getMediumIssues(),
                        summary.getLowIssues(),
                        summary.getSecurityScore(),
                        summary.getQualityScore(),
                        summary.getArchitectureScore());

                /*
                 * STEP 8
                 * Create report
                 */
                AnalysisReport report =
                        AnalysisReport.builder()
                                .analysis(analysis)
                                .reportType(ReportType.SUMMARY)
                                .format(ReportFormat.JSON)
                                .content(reportData)
                                .build();

                analysisReportRepository.save(report);

                analysis.setReport(report);

                /*
                 * STEP 9
                 * Complete analysis
                 */
                analysis.setCompletedAt(
                        LocalDateTime.now()
                );

                analysis.setStatus(
                        AnalysisStatus.COMPLETED
                );

                Analysis completedAnalysis =
                        analysisRepository.save(analysis);

                /*
                 * STEP 10
                 * Publish completed event
                 */
                eventPublisher.publishEvent(
                        new AnalysisCompletedEvent(
                                completedAnalysis.getId(),
                                repository.getId()
                        )
                );

            } catch (Exception ex) {
                try {
                    java.io.StringWriter sw = new java.io.StringWriter();
                    java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                    ex.printStackTrace(pw);
                    java.nio.file.Files.writeString(
                        java.nio.file.Paths.get("d:/DevGuardian/devguardian-backend/scan_error.log"),
                        "Analysis ID: " + analysisId + "\n" + sw.toString()
                    );
                } catch (Exception e) {
                    // ignore
                }

                log.error(
                        "Analysis failed for ID {}",
                        analysisId,
                        ex
                );

                analysis.setStatus(
                        AnalysisStatus.FAILED
                );

                analysis.setCompletedAt(
                        LocalDateTime.now()
                );

                analysisRepository.save(analysis);
            }
        }

        @Override
        @Transactional(readOnly = true)
        public Analysis getAnalysisById(Long analysisId) {

                Analysis analysis = analysisRepository.findById(analysisId)
                                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));

                analysisAccessValidator.validateOwnership(analysis, currentUserUtil.getCurrentUser().getId());

                return analysis;
        }

        @Override
        @Transactional(readOnly = true)
        public List<Analysis> getRepositoryAnalyses(Long repositoryId) {

                RepositoryResponse repository = repositoryClient.getRepository(repositoryId);
                if (repository == null) {
                    throw new ResourceNotFoundException("Repository not found");
                }

                if (!repository.getUserId().equals(currentUserUtil.getCurrentUser().getId())) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "You do not have permission to access this repository"
                    );
                }

                return analysisRepository.findByRepositoryIdOrderByCreatedAtDesc(repositoryId);
        }

        @Override
        @Transactional(readOnly = true)
        public List<Issue> getAnalysisIssues(Long analysisId) {

                Analysis analysis = analysisRepository.findById(analysisId)
                                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));

                analysisAccessValidator.validateOwnership(analysis, currentUserUtil.getCurrentUser().getId());

                return issueRepository.findByAnalysisId(analysis.getId());
        }
}