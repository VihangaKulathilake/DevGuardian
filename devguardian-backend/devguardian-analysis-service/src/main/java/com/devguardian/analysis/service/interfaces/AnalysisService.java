package com.devguardian.analysis.service.interfaces;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.entity.Issue;

import java.util.List;

public interface AnalysisService {

    Analysis startAnalysis(Long repositoryId);
    Analysis getAnalysisById(Long analysisId);
    List<Analysis> getRepositoryAnalyses(Long repositoryId);
    List<Issue> getAnalysisIssues(Long analysisId);
    void executeAnalysis(Long analysisId);
}