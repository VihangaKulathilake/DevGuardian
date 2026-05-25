package com.devguardian.repository;

import com.devguardian.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByAnalysisId(Long analysisId);
}