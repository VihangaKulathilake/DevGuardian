package com.devguardian.analysis.repository;

import com.devguardian.analysis.dto.projection.IssueCountProjection;
import com.devguardian.analysis.entity.Issue;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByAnalysisId(Long analysisId);

    @Query("SELECT i.analysis.id AS analysisId, i.severity AS severity, i.category AS category, COUNT(i.id) AS count " +
           "FROM Issue i WHERE i.analysis.id IN :analysisIds " +
           "GROUP BY i.analysis.id, i.severity, i.category")
    List<IssueCountProjection> countIssuesByAnalysisIds(@Param("analysisIds") List<Long> analysisIds);

    @Query("SELECT i FROM Issue i WHERE i.analysis.id IN :analysisIds " +
           "ORDER BY CASE " +
           "WHEN i.severity = com.devguardian.analysis.enums.SeverityLevel.CRITICAL THEN 1 " +
           "WHEN i.severity = com.devguardian.analysis.enums.SeverityLevel.HIGH THEN 2 " +
           "WHEN i.severity = com.devguardian.analysis.enums.SeverityLevel.MEDIUM THEN 3 " +
           "ELSE 4 END ASC, i.createdAt DESC")
    List<Issue> findTopIssuesByAnalysisIds(@Param("analysisIds") List<Long> analysisIds, Pageable pageable);
}
