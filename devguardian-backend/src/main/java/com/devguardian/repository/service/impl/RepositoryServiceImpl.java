package com.devguardian.repository.service.impl;

import com.devguardian.constants.Messages;
import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.entity.Repository;
import com.devguardian.auth.entity.User;
import com.devguardian.repository.enums.RepositoryStatus;
import com.devguardian.repository.mapper.RepositoryMapper;
import com.devguardian.repository.repository.RepositoryRepository;
import com.devguardian.repository.service.interfaces.RepositoryService;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RepositoryServiceImpl implements RepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final RepositoryMapper repositoryMapper;
    private final CurrentUserUtil currentUserUtil;

    // CREATE REPOSITORY
    @Override
    public RepositoryResponse createRepository(CreateRepositoryRequest request) {

        User user = currentUserUtil.getCurrentUser();

        Repository repository = repositoryMapper.toEntity(request);

        repository.setUser(user);
        repository.setStatus(RepositoryStatus.ACTIVE);

        Repository saved = repositoryRepository.save(repository);

        return repositoryMapper.toResponse(saved);
    }

    // GET ALL USER REPOSITORIES
    @Override
    public List<RepositoryResponse> getUserRepositories() {

        User user = currentUserUtil.getCurrentUser();

        List<Repository> repositories = repositoryRepository.findByUserId(user.getId());

        return repositoryMapper.toResponse(repositories);
    }

    // GET REPOSITORY BY ID
    @Override
    public RepositoryResponse getRepositoryById(Long id) {

        User user = currentUserUtil.getCurrentUser();

        Repository repository = repositoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        return repositoryMapper.toResponse(repository);
    }

    // UPDATE REPOSITORY
    @Override
    public RepositoryResponse updateRepository(Long id, UpdateRepositoryRequest request) {

        User user = currentUserUtil.getCurrentUser();

        Repository repository = repositoryRepository.findByIdAndUserId(id, user.getId())
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

        User user = currentUserUtil.getCurrentUser();

        Repository repository = repositoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        repositoryRepository.delete(repository);
    }
}
