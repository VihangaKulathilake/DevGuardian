package com.devguardian.repository.repository;

import com.devguardian.repository.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RepositoryRepository extends JpaRepository<Repository, Long> {
    List<Repository> findByUserId(Long userId);

    Optional<Repository> findByIdAndUserId(
            Long repositoryId,
            Long userId
    );

    boolean existsByCloneUrl(String cloneUrl);
    Optional<Repository> findByUserIdAndGithubRepoId(Long userId, Long githubRepoId);
}
