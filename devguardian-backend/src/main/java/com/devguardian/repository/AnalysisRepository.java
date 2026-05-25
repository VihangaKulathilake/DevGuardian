package com.devguardian.repository;

import com.devguardian.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByRepositoryId(Long repositoryId);
}