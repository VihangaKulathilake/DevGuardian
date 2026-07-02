package com.devguardian.repository.service.impl;

import com.devguardian.constants.Messages;
import com.devguardian.github.client.GithubApiClient;
import com.devguardian.github.dto.GithubRepositoryResponse;
import com.devguardian.github.entity.GithubConnection;
import com.devguardian.github.service.interfaces.GithubConnectionService;
import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.ImportRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.enums.*;
import com.devguardian.repository.mapper.RepositoryMapper;
import com.devguardian.repository.repository.RepositoryRepository;
import com.devguardian.repository.service.interfaces.RepositoryService;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RepositoryServiceImpl implements RepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final RepositoryMapper repositoryMapper;
    private final CurrentUserUtil currentUserUtil;
    private final GithubConnectionService githubConnectionService;
    private final GithubApiClient githubApiClient;

    // CREATE REPOSITORY
    @Override
    public RepositoryResponse createRepository(CreateRepositoryRequest request) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryMapper.toEntity(request);

        repository.setUserId(userId);
        repository.setStatus(RepositoryStatus.ACTIVE);

        Repository saved = repositoryRepository.save(repository);

        return repositoryMapper.toResponse(saved);
    }

    // GET ALL USER REPOSITORIES
    @Override
    @Transactional(readOnly = true)
    public List<RepositoryResponse> getUserRepositories() {

        Long userId = currentUserUtil.getCurrentUser().getId();

        List<Repository> repositories = repositoryRepository.findByUserId(userId);

        return repositoryMapper.toResponse(repositories);
    }

    // GET REPOSITORY BY ID
    @Override
    @Transactional(readOnly = true)
    public RepositoryResponse getRepositoryById(Long id) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        return repositoryMapper.toResponse(repository);
    }

    // UPDATE REPOSITORY
    @Override
    public RepositoryResponse updateRepository(Long id, UpdateRepositoryRequest request) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        repository.setName(request.getName());
        repository.setDescription(request.getDescription());
        repository.setBranch(request.getBranch());
        repository.setLanguage(request.getLanguage());
        repository.setVisibility(request.getVisibility());
        repository.setType(request.getType());
        repository.setScanFrequency(request.getScanFrequency());

        Repository updated = repositoryRepository.save(repository);

        return repositoryMapper.toResponse(updated);
    }

    // DELETE REPOSITORY
    @Override
    public void deleteRepository(Long id) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        repositoryRepository.delete(repository);
    }

    @Override
    public RepositoryResponse importRepository(ImportRepositoryRequest request) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        GithubConnection connection =
                githubConnectionService.getCurrentUserConnection();

        // 1. Get GitHub repos
        List<GithubRepositoryResponse> repos =
                githubApiClient.getUserRepositories(connection.getAccessToken());

        // 2. Find selected repo
        GithubRepositoryResponse selected = repos.stream()
                .filter(r -> r.getId().equals(request.getGithubRepoId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Repo not found"));

        // 3. Prevent duplicate import
        repositoryRepository.findByUserIdAndGithubRepoId(userId, selected.getId())
                .ifPresent(r -> {
                    throw new RuntimeException("Already imported");
                });

        // 4. Save in DevGuardian DB
        Repository repository = Repository.builder()
                .userId(userId)
                .name(selected.getName())
                .fullName(selected.getFullName())
                .githubRepoId(selected.getId())
                .cloneUrl(selected.getCloneUrl())
                .branch(selected.getDefaultBranch())
                .provider(RepositoryProvider.GITHUB)
                .status(RepositoryStatus.IMPORTED)
                .visibility(selected.isPrivate() ? Visibility.PRIVATE : Visibility.PUBLIC)
                .build();

        Repository saved = repositoryRepository.save(repository);

        return repositoryMapper.toResponse(saved);
    }
}
