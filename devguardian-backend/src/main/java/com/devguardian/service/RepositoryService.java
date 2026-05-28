package com.devguardian.service;

import java.util.List;
import com.devguardian.dto.repository.CreateRepositoryRequest;
import com.devguardian.dto.repository.RepositoryResponse;
import com.devguardian.dto.repository.UpdateRepositoryRequest;

public interface RepositoryService {
    RepositoryResponse createRepository(CreateRepositoryRequest request);

    List<RepositoryResponse> getUserRepositories();

    RepositoryResponse getRepositoryById(Long id);

    RepositoryResponse updateRepository(Long id, UpdateRepositoryRequest request);

    void deleteRepository(Long id);
}
