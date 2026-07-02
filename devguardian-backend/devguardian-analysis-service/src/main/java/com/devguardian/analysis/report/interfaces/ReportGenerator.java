package com.devguardian.analysis.report.interfaces;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.report.model.AnalysisReportSummary;

public interface ReportGenerator {

    AnalysisReportSummary generate(Analysis analysis);
}