package com.devguardian.repository.controller;

import com.devguardian.common.exception.response.ErrorResponse;
import com.devguardian.constants.ApiEndpoints;
import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.ImportRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.service.interfaces.RepositoryService;
import com.devguardian.config.StandardErrorResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.List;

@Tag(
        name = "Repository APIs",
        description = "Endpoints for configuring and managing code repositories to scan"
)
@RestController
@RequestMapping(ApiEndpoints.REPOSITORIES)
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@StandardErrorResponses
public class RepositoryController {

    private final RepositoryService repositoryService;

    @Operation(
            summary = "Create a new repository configuration",
            description = "Registers a new git repository for automatic vulnerability analysis scans"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Repository configuration created successfully"
    )
    @PostMapping
    public RepositoryResponse createRepository(
            @Valid @RequestBody CreateRepositoryRequest request
    ) {
        return repositoryService.createRepository(request);
    }

    @Operation(
            summary = "Import a GitHub repository",
            description = "Imports a repository directly from the authenticated user's GitHub account"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Repository imported successfully"
    )
    @PostMapping("/import")
    public RepositoryResponse importRepository(
            @Valid @RequestBody ImportRepositoryRequest request
    ) {
        return repositoryService.importRepository(request);
    }

    @Operation(
            summary = "Retrieve user repositories",
            description = "Returns a list of all repositories configured by the currently authenticated user"
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of user repositories retrieved successfully"
    )
    @GetMapping
    public List<RepositoryResponse> getUserRepositories() {
        return repositoryService.getUserRepositories();
    }

    @Operation(
            summary = "Get repository by identifier",
            description = "Retrieves the detailed configuration details of a repository by its unique database ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Repository configuration found and returned successfully"
    )
    @GetMapping("/{id}")
    public RepositoryResponse getRepositoryById(
            @PathVariable Long id
    ) {
        return repositoryService.getRepositoryById(id);
    }

    @Operation(
            summary = "Update repository configuration",
            description = "Modifies the metadata or scan settings of an existing repository configuration"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Repository configuration updated successfully"
    )
    @PutMapping("/{id}")
    public RepositoryResponse updateRepository(
            @PathVariable Long id,
            @RequestBody UpdateRepositoryRequest request
    ) {
        return repositoryService.updateRepository(id, request);
    }

    @Operation(
            summary = "Delete repository configuration",
            description = "Permanently removes a repository configuration and its associated scan results"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Repository configuration deleted successfully"
    )
    @DeleteMapping("/{id}")
    public void deleteRepository(
            @PathVariable Long id
    ) {
        repositoryService.deleteRepository(id);
    }

    @Operation(
            summary = "Clone a repository configuration",
            description = "Triggers the git clone flow for a repository to scan it locally"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Repository cloned successfully"
    )
    @PostMapping("/{id}/clone")
    public void cloneRepository(@PathVariable Long id) {
        repositoryService.cloneRepository(id);
    }

    @Operation(
            summary = "Upload repository ZIP file",
            description = "Uploads a zip archive of a repository from the client machine, extracts it, and registers it as a local codebase"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Repository ZIP uploaded and extracted successfully"
    )
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RepositoryResponse uploadRepository(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "branch", required = false, defaultValue = "main") String branch,
            @RequestParam(value = "language", required = false, defaultValue = "Auto") String language
    ) {
        return repositoryService.uploadRepository(file, name, branch, language);
    }

    @Operation(
            summary = "Fetch remote repository branches",
            description = "Inspects a public git repository URL to validate its availability and list all existing branches"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Remote branches retrieved successfully"
    )
    @GetMapping("/remote-branches")
    public com.devguardian.repository.dto.RemoteBranchesResponse getRemoteBranches(
            @RequestParam("url") String url
    ) {
        return repositoryService.getRemoteBranches(url);
    }
}
