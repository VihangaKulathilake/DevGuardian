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
import com.devguardian.github.entity.GithubConnection;
import com.devguardian.github.service.interfaces.GithubConnectionService;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.repository.RepositoryRepository;
import com.devguardian.repository.service.interfaces.CloneService;
import com.devguardian.repository.util.RepositoryAccessValidator;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AnalysisServiceImpl implements AnalysisService {

        private final RepositoryRepository repositoryRepository;
        private final AnalysisRepository analysisRepository;
        private final IssueRepository issueRepository;

        // private final RepositoryScanner repositoryScanner;
        private final RepositoryScanner mockRepositoryScanner;
        private final GitRepositoryScanner gitRepositoryScanner;
        private final RuleEngine ruleEngine;

        private final ScoreCalculator scoreCalculator;

        private final ReportGenerator reportGenerator;
        private final AnalysisReportRepository analysisReportRepository;

        private final ApplicationEventPublisher eventPublisher;

        private final AnalysisAccessValidator analysisAccessValidator;
        private final RepositoryAccessValidator repositoryAccessValidator;
        private final CurrentUserUtil currentUserUtil;

        private final CloneService cloneService;
        private final GithubConnectionService githubConnectionService;

        @Override
        @Transactional
        public Analysis startAnalysis(Long repositoryId) {

            Repository repository =
                    repositoryRepository.findById(repositoryId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Repository not found"
                                    ));

            repositoryAccessValidator.validateOwnership(
                    repository,
                    currentUserUtil.getCurrentUser().getId()
            );

            /*
             * Clone repository
             */

            GithubConnection connection =
                    githubConnectionService
                            .getCurrentUserConnection();

            cloneService.cloneRepository(
                    repository,
                    connection
            );

            /*
             * Create RUNNING analysis
             */

            Analysis analysis =
                    analysisRepository.save(
                            Analysis.builder()
                                    .repository(repository)
                                    .status(AnalysisStatus.RUNNING)
                                    .startedAt(LocalDateTime.now())
                                    .build()
                    );

            /*
             * Publish event
             */

            eventPublisher.publishEvent(
                    new AnalysisStartedEvent(
                            analysis.getId(),
                            repository.getId()
                    )
            );

            return analysis;
        }

        @Override
        @Transactional
        public void executeAnalysis(Long analysisId) {

            Analysis analysis = analysisRepository.findById(analysisId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Analysis not found"
                            ));

            try {

                Repository repository = analysis.getRepository();

                /*
                 * STEP 1
                 * Scan repository files
                 */
                // Replace mockRepositoryScanner later
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
                issues.forEach(issue -> {
                    issue.setAnalysis(analysis);
                    if (issue.getCodeSnippet() == null || issue.getCodeSnippet().isBlank()) {
                        String fileContent = context.getFiles().get(issue.getFilePath());
                        if (fileContent != null) {
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
                        eventPublisher.publishEvent(new IssueCreatedEvent(issue)));

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

                Repository repository = repositoryRepository.findById(repositoryId)
                                .orElseThrow(() -> new ResourceNotFoundException("Repository not found"));

                repositoryAccessValidator.validateOwnership(repository, currentUserUtil.getCurrentUser().getId());

                return analysisRepository.findByRepositoryOrderByCreatedAtDesc(repository);
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