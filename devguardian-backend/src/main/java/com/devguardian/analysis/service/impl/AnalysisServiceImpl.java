package com.devguardian.analysis.service.impl;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.AnalysisStatus;
import com.devguardian.analysis.repository.AnalysisRepository;
import com.devguardian.analysis.repository.IssueRepository;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.engine.RuleEngine;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.repository.RepositoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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

    @Override
    public Analysis startAnalysis(Long repositoryId) {

        /*
         * STEP 1
         * Fetch repository
         */
        Repository repository = repositoryRepository.findById(repositoryId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Repository not found")
                );

        /*
         * STEP 2
         * Create analysis record
         */
        Analysis analysis = Analysis.builder()
                .repository(repository)
                .status(AnalysisStatus.RUNNING)
                .startedAt(LocalDateTime.now())
                .build();

        Analysis savedAnalysis = analysisRepository.save(analysis);

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
        issues.forEach(issue -> issue.setAnalysis(savedAnalysis));

        /*
         * STEP 6
         * Save issues
         */
        issueRepository.saveAll(issues);

        /*
         * STEP 7
         * Update analysis statistics
         */
        analysis.setIssues(issues);

        analysis.setSecurityScore(
                Math.max(0, 100 - (issues.size() * 10))
        );

        analysis.setCompletedAt(LocalDateTime.now());

        analysis.setStatus(AnalysisStatus.COMPLETED);

        /*
         * STEP 8
         * Save final analysis
         */
        return analysisRepository.save(analysis);
    }

    @Override
    @Transactional(readOnly = true)
    public Analysis getAnalysisById(Long analysisId) {

        return analysisRepository.findById(analysisId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Analysis not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Analysis> getRepositoryAnalyses(Long repositoryId) {

        Repository repository = repositoryRepository.findById(repositoryId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Repository not found"));

        return analysisRepository.findByRepositoryOrderByCreatedAtDesc(repository);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Issue> getAnalysisIssues(Long analysisId) {

        if (!analysisRepository.existsById(analysisId)) {
            throw new EntityNotFoundException("Analysis not found");
        }

        return issueRepository.findByAnalysisId(analysisId);
    }
}