package com.devguardian.analysis.service.impl;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.entity.AnalysisReport;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.AnalysisStatus;
import com.devguardian.analysis.enums.ReportFormat;
import com.devguardian.analysis.enums.ReportType;
import com.devguardian.analysis.events.AnalysisCompletedEvent;
import com.devguardian.analysis.report.interfaces.ReportGenerator;
import com.devguardian.analysis.report.model.AnalysisReportSummary;
import com.devguardian.analysis.repository.AnalysisReportRepository;
import com.devguardian.analysis.repository.AnalysisRepository;
import com.devguardian.analysis.repository.IssueRepository;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.engine.RuleEngine;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.analysis.scoring.interfaces.ScoreCalculator;
import com.devguardian.analysis.scoring.model.ScoreResult;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import com.devguardian.analysis.util.AnalysisAccessValidator;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.repository.RepositoryRepository;
import com.devguardian.repository.util.RepositoryAccessValidator;
import com.devguardian.security.CurrentUserUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AnalysisServiceImpl implements AnalysisService {

        private final RepositoryRepository repositoryRepository;
        private final AnalysisRepository analysisRepository;
        private final IssueRepository issueRepository;

        private final RepositoryScanner repositoryScanner;
        private final RuleEngine ruleEngine;

        private final ScoreCalculator scoreCalculator;

        private final ReportGenerator reportGenerator;
        private final AnalysisReportRepository analysisReportRepository;

        private final ApplicationEventPublisher eventPublisher;

        private final AnalysisAccessValidator analysisAccessValidator;
        private final RepositoryAccessValidator repositoryAccessValidator;
        private final CurrentUserUtil currentUserUtil;

        @Override
        public Analysis startAnalysis(Long repositoryId) {

                /*
                 * STEP 1
                 * Fetch repository
                 */
                Repository repository = repositoryRepository.findById(repositoryId)
                                .orElseThrow(() -> new EntityNotFoundException("Repository not found"));

                repositoryAccessValidator.validateOwnership(repository, currentUserUtil.getCurrentUser());

                /*
                 * STEP 2
                 * Create analysis record
                 */
                Analysis analysis = analysisRepository.save(
                                Analysis.builder()
                                                .repository(repository)
                                                .status(AnalysisStatus.RUNNING)
                                                .startedAt(LocalDateTime.now())
                                                .build());

                /*
                 * STEP 3
                 * Scan repository files
                 */
                ScanContext context = repositoryScanner.scan(repository);

                /*
                 * STEP 4
                 * Run rule engine
                 */
                List<Issue> issues = ruleEngine.runAllRules(context);

                /*
                 * STEP 5
                 * Attach analysis to issues
                 */
                issues.forEach(issue -> issue.setAnalysis(analysis));

                analysis.setIssues(issues);

                /*
                 * STEP 6
                 * Save issues
                 */
                issueRepository.saveAll(issues);

                /*
                 * STEP 7
                 * Calculate scores
                 */
                ScoreResult scoreResult = scoreCalculator.calculateScores(issues);

                analysis.setSecurityScore(
                                scoreResult.getSecurityScore());

                analysis.setQualityScore(
                                scoreResult.getQualityScore());

                analysis.setArchitectureScore(
                                scoreResult.getArchitectureScore());

                /*
                 * STEP 8
                 * Generate report summary
                 */
                AnalysisReportSummary summary = reportGenerator.generate(analysis);

                /*
                 * STEP 9
                 * Build report data
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
                 * STEP 10
                 * Create analysis report
                 */
                AnalysisReport report = AnalysisReport.builder()
                                .analysis(analysis)
                                .reportType(ReportType.SUMMARY)
                                .format(ReportFormat.JSON)
                                .content(reportData)
                                .build();

                analysisReportRepository.save(report);
                analysis.setReport(report);

                /*
                 * STEP 11
                 * Complete analysis
                 */
                analysis.setCompletedAt(LocalDateTime.now());

                analysis.setStatus(AnalysisStatus.COMPLETED);
                Analysis completedAnalysis = analysisRepository.save(analysis);

                eventPublisher.publishEvent(new AnalysisCompletedEvent(completedAnalysis.getId(), repository.getId()));

                /*
                 * STEP 12
                 * Save final analysis
                 */
                return completedAnalysis;
        }

        @Override
        @Transactional(readOnly = true)
        public Analysis getAnalysisById(Long analysisId) {

            Analysis analysis = analysisRepository.findById(analysisId)
                    .orElseThrow(() -> new EntityNotFoundException("Analysis not found"));

            analysisAccessValidator.validateOwnership(analysis, currentUserUtil.getCurrentUser());

            return analysis;
        }

        @Override
        @Transactional(readOnly = true)
        public List<Analysis> getRepositoryAnalyses(Long repositoryId) {

                Repository repository = repositoryRepository.findById(repositoryId)
                                .orElseThrow(() -> new EntityNotFoundException("Repository not found"));

                repositoryAccessValidator.validateOwnership(repository,currentUserUtil.getCurrentUser());

                return analysisRepository.findByRepositoryOrderByCreatedAtDesc(repository);
        }

        @Override
        @Transactional(readOnly = true)
        public List<Issue> getAnalysisIssues(Long analysisId) {

                Analysis analysis = analysisRepository.findById(analysisId)
                        .orElseThrow(() -> new EntityNotFoundException("Analysis not found"));

                analysisAccessValidator.validateOwnership(analysis, currentUserUtil.getCurrentUser());

                return issueRepository.findByAnalysisId(analysis.getId());
        }
}