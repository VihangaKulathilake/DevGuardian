package com.devguardian.repository;

import com.devguardian.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepositoryRepository extends JpaRepository<Repository, Long> {
    List<Repository> findByUserId(Long userId);
}