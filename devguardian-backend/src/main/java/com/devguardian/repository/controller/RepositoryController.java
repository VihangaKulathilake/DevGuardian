package com.devguardian.repository.controller;

import com.devguardian.constants.ApiEndpoints;
import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.service.RepositoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiEndpoints.REPOSITORIES)
@RequiredArgsConstructor
public class RepositoryController {

    private final RepositoryService repositoryService;

    @PostMapping
    public RepositoryResponse createRepository(
            @Valid @RequestBody CreateRepositoryRequest request
    ) {
        return repositoryService.createRepository(request);
    }

    @GetMapping
    public List<RepositoryResponse> getUserRepositories() {
        return repositoryService.getUserRepositories();
    }

    @GetMapping("/{id}")
    public RepositoryResponse getRepositoryById(
            @PathVariable Long id
    ) {
        return repositoryService.getRepositoryById(id);
    }

    @PutMapping("/{id}")
    public RepositoryResponse updateRepository(
            @PathVariable Long id,
            @RequestBody UpdateRepositoryRequest request
    ) {
        return repositoryService.updateRepository(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteRepository(
            @PathVariable Long id
    ) {
        repositoryService.deleteRepository(id);
    }
}
