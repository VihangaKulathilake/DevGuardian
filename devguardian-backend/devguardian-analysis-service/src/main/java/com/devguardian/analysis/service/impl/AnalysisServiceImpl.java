package com.devguardian.analysis.service.impl;

import com.devguardian.analysis.dto.projection.IssueCountProjection;
import com.devguardian.analysis.dto.response.*;
import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.entity.AnalysisReport;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.AnalysisStatus;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.ReportFormat;
import com.devguardian.analysis.enums.ReportType;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.events.AnalysisCompletedEvent;
import com.devguardian.analysis.events.AnalysisStartedEvent;
import com.devguardian.analysis.events.IssueCreatedEvent;
import com.devguardian.analysis.mapper.IssueMapper;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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
        private final IssueMapper issueMapper;

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

        @Override
        @Transactional(readOnly = true)
        public DashboardSummaryResponse getDashboardSummary() {
            // 1. Single Feign RPC to retrieve repositories owned by the authenticated user
            List<RepositoryResponse> userRepos = repositoryClient.getUserRepositories();
            if (userRepos == null || userRepos.isEmpty()) {
                return DashboardSummaryResponse.builder()
                        .totalRepositories(0)
                        .totalScans(0)
                        .avgSecurityScore(0)
                        .scoreGrade("N/A")
                        .totalVulnerabilities(0)
                        .totalCodeSmells(0)
                        .totalCriticalAlerts(0)
                        .hasData(false)
                        .repositories(Collections.emptyList())
                        .recentAlerts(Collections.emptyList())
                        .recentActivities(Collections.emptyList())
                        .vulnerabilitiesOverTime(Collections.emptyList())
                        .build();
            }

            List<Long> repoIds = userRepos.stream().map(RepositoryResponse::getId).toList();
            Map<Long, RepositoryResponse> repoMap = userRepos.stream()
                    .collect(Collectors.toMap(RepositoryResponse::getId, r -> r, (r1, r2) -> r1));

            // 2. Fetch all historical analyses for all user's repositories in 1 DB query
            List<Analysis> allAnalyses = analysisRepository.findByRepositoryIdInOrderByCreatedAtDesc(repoIds);

            // Group analyses by repository ID
            Map<Long, List<Analysis>> analysesByRepo = new HashMap<>();
            for (Analysis a : allAnalyses) {
                analysesByRepo.computeIfAbsent(a.getRepositoryId(), k -> new ArrayList<>()).add(a);
            }

            // Identify latest analysis and latest completed scan per repository
            List<Long> latestCompletedAnalysisIds = new ArrayList<>();
            Map<Long, Analysis> latestAnalysisPerRepo = new HashMap<>();

            for (Long repoId : repoIds) {
                List<Analysis> repoScans = analysesByRepo.get(repoId);
                if (repoScans != null && !repoScans.isEmpty()) {
                    latestAnalysisPerRepo.put(repoId, repoScans.get(0));

                    for (Analysis s : repoScans) {
                        if (s.getStatus() == AnalysisStatus.COMPLETED) {
                            latestCompletedAnalysisIds.add(s.getId());
                            break;
                        }
                    }
                }
            }

            // 3. Database aggregation: Count issues by (analysisId, severity, category) in 1 DB query
            Map<Long, Map<String, Integer>> issueStatsPerAnalysis = new HashMap<>();
            int totalVulnerabilities = 0;
            int totalCodeSmells = 0;
            int totalCriticalAlerts = 0;

            if (!latestCompletedAnalysisIds.isEmpty()) {
                List<IssueCountProjection> issueCounts = issueRepository.countIssuesByAnalysisIds(latestCompletedAnalysisIds);
                for (IssueCountProjection countProj : issueCounts) {
                    Long aId = countProj.getAnalysisId();
                    int count = countProj.getCount().intValue();

                    issueStatsPerAnalysis.computeIfAbsent(aId, k -> new HashMap<>());
                    Map<String, Integer> aStats = issueStatsPerAnalysis.get(aId);

                    SeverityLevel sev = countProj.getSeverity();
                    IssueCategory cat = countProj.getCategory();

                    if (sev == SeverityLevel.CRITICAL) {
                        aStats.put("critical", aStats.getOrDefault("critical", 0) + count);
                        totalCriticalAlerts += count;
                    } else if (sev == SeverityLevel.HIGH || sev == SeverityLevel.MEDIUM) {
                        aStats.put("warning", aStats.getOrDefault("warning", 0) + count);
                    } else if (sev == SeverityLevel.LOW) {
                        aStats.put("info", aStats.getOrDefault("info", 0) + count);
                    }

                    if (cat == IssueCategory.SECURITY) {
                        totalVulnerabilities += count;
                    } else if (cat == IssueCategory.CODE_QUALITY) {
                        totalCodeSmells += count;
                    }
                }
            }

            // 4. Build per-repository summary
            int totalSecurityScore = 0;
            int completedScansCount = 0;
            List<DashboardRepoSummary> repoSummaries = new ArrayList<>();

            for (RepositoryResponse repo : userRepos) {
                Analysis latest = latestAnalysisPerRepo.get(repo.getId());
                Analysis latestCompleted = null;
                List<Analysis> repoScans = analysesByRepo.get(repo.getId());
                if (repoScans != null) {
                    for (Analysis s : repoScans) {
                        if (s.getStatus() == AnalysisStatus.COMPLETED) {
                            latestCompleted = s;
                            break;
                        }
                    }
                }

                int crit = 0;
                int warn = 0;
                int inf = 0;
                if (latestCompleted != null && issueStatsPerAnalysis.containsKey(latestCompleted.getId())) {
                    Map<String, Integer> st = issueStatsPerAnalysis.get(latestCompleted.getId());
                    crit = st.getOrDefault("critical", 0);
                    warn = st.getOrDefault("warning", 0);
                    inf = st.getOrDefault("info", 0);
                }

                if (latest != null && latest.getStatus() == AnalysisStatus.COMPLETED) {
                    totalSecurityScore += (latest.getSecurityScore() != null ? latest.getSecurityScore() : 100);
                    completedScansCount++;
                }

                repoSummaries.add(DashboardRepoSummary.builder()
                        .id(repo.getId())
                        .name(repo.getName())
                        .url(repo.getUrl())
                        .visibility(repo.getVisibility() != null ? repo.getVisibility().name() : "PUBLIC")
                        .language(repo.getLanguage())
                        .branch(repo.getBranch())
                        .provider(repo.getProvider() != null ? repo.getProvider().name() : null)
                        .latestAnalysisId(latest != null ? latest.getId() : null)
                        .status(latest != null ? latest.getStatus() : null)
                        .securityScore(latest != null ? latest.getSecurityScore() : null)
                        .qualityScore(latest != null ? latest.getQualityScore() : null)
                        .lastAnalyzed(latest != null ? (latest.getStartedAt() != null ? latest.getStartedAt() : latest.getCreatedAt()) : null)
                        .criticalIssues(crit)
                        .warningIssues(warn)
                        .infoIssues(inf)
                        .totalIssues(crit + warn + inf)
                        .build());
            }

            // 5. Score Grade Calculation
            int avgScore = completedScansCount > 0 ? Math.round((float) totalSecurityScore / completedScansCount) : 0;
            String scoreGrade = "N/A";
            if (completedScansCount > 0) {
                if (avgScore >= 90) scoreGrade = "A";
                else if (avgScore >= 80) scoreGrade = "B";
                else if (avgScore >= 70) scoreGrade = "C";
                else if (avgScore >= 60) scoreGrade = "D";
                else scoreGrade = "F";
            }

            // 6. Recent Alerts (Top 4 critical/high issues from latest completed scans with repository details)
            if (!latestCompletedAnalysisIds.isEmpty()) {
                Map<Long, Long> analysisToRepoId = new HashMap<>();
                        .stream()
                        .map(issue -> {
                            Long rId = null;

            // 7. Recent Activities (Latest 5 scans)
            List<DashboardActivityResponse> recentActivities = allAnalyses.stream()
                    .limit(5)
                    .map(scan -> {
                        RepositoryResponse repo = repoMap.get(scan.getRepositoryId());
                        String repoName = repo != null ? repo.getName() : "Repository #" + scan.getRepositoryId();
                        String action = "Scan Triggered";
                        String details = "Analysis scan started on branch '" + (repo != null && repo.getBranch() != null ? repo.getBranch() : "main") + "'.";

                        if (scan.getStatus() == AnalysisStatus.COMPLETED) {
                            action = "Scan Completed";
                            details = "Completed scan with score " + (scan.getSecurityScore() != null ? scan.getSecurityScore() : 100) + "/100.";
                        } else if (scan.getStatus() == AnalysisStatus.FAILED) {
                            action = "Scan Failed";
                            details = "Vulnerability scanning engine encountered errors.";
                        }

                        int totalIss = 0;
                        if (issueStatsPerAnalysis.containsKey(scan.getId())) {
                            Map<String, Integer> st = issueStatsPerAnalysis.get(scan.getId());
                            totalIss = st.getOrDefault("critical", 0) + st.getOrDefault("warning", 0) + st.getOrDefault("info", 0);
                        }

                        return DashboardActivityResponse.builder()
                                .action(action)
                                .repoName(repoName)
                                .details(details)
                                .timestamp(scan.getStartedAt() != null ? scan.getStartedAt() : scan.getCreatedAt())
                                .status(scan.getStatus())
                                .securityScore(scan.getSecurityScore())
                                .totalIssues(totalIss)
                                .build();
                    })
                    .toList();

            // 8. Vulnerabilities Over Time Trend
            Map<String, Integer> issuesByDate = new TreeMap<>();
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

            allAnalyses.stream()
                    .filter(s -> s.getStatus() == AnalysisStatus.COMPLETED && (s.getStartedAt() != null || s.getCreatedAt() != null))
                    .sorted(Comparator.comparing(s -> s.getStartedAt() != null ? s.getStartedAt() : s.getCreatedAt()))
                    .forEach(scan -> {
                        LocalDateTime dt = scan.getStartedAt() != null ? scan.getStartedAt() : scan.getCreatedAt();
                        String d = dt.format(dtf);
                        int count = 0;
                        if (issueStatsPerAnalysis.containsKey(scan.getId())) {
                            Map<String, Integer> st = issueStatsPerAnalysis.get(scan.getId());
                            count = st.getOrDefault("critical", 0) + st.getOrDefault("warning", 0) + st.getOrDefault("info", 0);
                        }
                        issuesByDate.put(d, issuesByDate.getOrDefault(d, 0) + count);
                    });

            List<VulnerabilityTrendPoint> trend = issuesByDate.entrySet().stream()
                    .map(e -> new VulnerabilityTrendPoint(e.getKey(), e.getValue()))
                    .toList();

            return DashboardSummaryResponse.builder()
                    .totalRepositories(userRepos.size())
                    .totalScans(allAnalyses.size())
                    .avgSecurityScore(avgScore)
                    .scoreGrade(scoreGrade)
                    .totalVulnerabilities(totalVulnerabilities)
                    .totalCodeSmells(totalCodeSmells)
                    .totalCriticalAlerts(totalCriticalAlerts)
                    .hasData(completedScansCount > 0)
                    .repositories(repoSummaries)
                    .recentAlerts(recentAlerts)
                    .recentActivities(recentActivities)
                    .vulnerabilitiesOverTime(trend)
                    .build();
        }
}