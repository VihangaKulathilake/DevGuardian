package com.devguardian.controller;

import com.devguardian.constants.ApiEndpoints;
import com.devguardian.dto.repository.CreateRepositoryRequest;
import com.devguardian.dto.repository.RepositoryResponse;
import com.devguardian.dto.repository.UpdateRepositoryRequest;
import com.devguardian.service.RepositoryService;
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