package com.devguardian.repository.service.interfaces;

import java.util.List;
import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.ImportRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.entity.Repository;

import org.springframework.web.multipart.MultipartFile;

public interface RepositoryService {
    RepositoryResponse createRepository(CreateRepositoryRequest request);

    List<RepositoryResponse> getUserRepositories();

    RepositoryResponse getRepositoryById(Long id);

    RepositoryResponse updateRepository(Long id, UpdateRepositoryRequest request);

    void deleteRepository(Long id);
    RepositoryResponse importRepository(ImportRepositoryRequest request);
    void cloneRepository(Long id);
    RepositoryResponse uploadRepository(MultipartFile file, String name, String branch, String language);
}

