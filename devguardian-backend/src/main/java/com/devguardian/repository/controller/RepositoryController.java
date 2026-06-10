package com.devguardian.repository.controller;

import com.devguardian.common.exception.response.ErrorResponse;
import com.devguardian.constants.ApiEndpoints;
import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.service.interfaces.RepositoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiEndpoints.REPOSITORIES)
@RequiredArgsConstructor
public class RepositoryController {

    private final RepositoryService repositoryService;

    @Operation(
            summary = "Create Repository"
    )
    @SecurityRequirement(name = "bearerAuth")
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

    @Operation(
            summary = "Get Repository By Id",
            description = "Retrieve a repository by its ID"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Repository retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Repository Not Found",
                    content = @Content(
                            schema = @Schema(
                                    implementation = ErrorResponse.class
                            )
                    )
            )
    })
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
