package com.devguardian.analysis.service.interfaces;

import com.devguardian.analysis.entity.Analysis;

public interface AnalysisService {

    Analysis startAnalysis(Long repositoryId);
}