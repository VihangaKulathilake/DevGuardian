package com.devguardian.analysis.repository;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.repository.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByRepositoryId(Long repositoryId);
    List<Analysis> findByRepositoryOrderByCreatedAtDesc(Repository repository);
}
