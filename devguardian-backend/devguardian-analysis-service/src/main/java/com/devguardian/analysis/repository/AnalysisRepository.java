package com.devguardian.analysis.repository;

import com.devguardian.analysis.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByRepositoryId(Long repositoryId);
    List<Analysis> findByRepositoryIdOrderByCreatedAtDesc(Long repositoryId);
    List<Analysis> findByRepositoryIdInOrderByCreatedAtDesc(List<Long> repositoryIds);
}
