package com.devguardian.analysis.repository;

import com.devguardian.analysis.entity.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalysisReportRepository
        extends JpaRepository<AnalysisReport, Long> {
}