package com.devguardian.analysis.controller;

import com.devguardian.analysis.dto.response.AnalysisResponse;
import com.devguardian.analysis.dto.response.DashboardSummaryResponse;
import com.devguardian.analysis.dto.response.IssueResponse;
import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.mapper.AnalysisMapper;
import com.devguardian.analysis.mapper.IssueMapper;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import com.devguardian.config.StandardErrorResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Analysis APIs",
        description = "Endpoints for triggering static analysis scans and inspecting code vulnerabilities/issues"
)
@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@StandardErrorResponses
public class AnalysisController {

    private final AnalysisService analysisService;
    private final AnalysisMapper analysisMapper;
    private final IssueMapper issueMapper;

    @Operation(
            summary = "Get aggregated dashboard summary",
            description = "Retrieves consolidated security scores, issue counts, repository statuses, and historical trends in a single fast query"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Dashboard summary retrieved successfully"
    )
    @GetMapping("/dashboard-summary")
    public DashboardSummaryResponse getDashboardSummary() {
        return analysisService.getDashboardSummary();
    }

    /*
     * Start repository analysis
     */
    @Operation(
            summary = "Trigger a repository analysis",
            description = "Starts an asynchronous vulnerability and quality analysis scan on the specified repository"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Analysis scan triggered and started successfully"
    )
    @PostMapping("/{repositoryId}/start")
    @ResponseStatus(HttpStatus.CREATED)
    public AnalysisResponse startAnalysis(
            @PathVariable Long repositoryId
    ) {

        Analysis analysis = analysisService.startAnalysis(repositoryId);

        return analysisMapper.toResponse(analysis);
    }

    @Operation(
            summary = "Get analysis run details",
            description = "Retrieves the status, score metrics, and details of a specific analysis run by its unique database ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Analysis details retrieved successfully"
    )
    @GetMapping("/{analysisId}")
    public AnalysisResponse getAnalysis(
            @PathVariable Long analysisId
    ) {

        Analysis analysis = analysisService.getAnalysisById(analysisId);

        return analysisMapper.toResponse(analysis);
    }

    @Operation(
            summary = "Get historical analyses for a repository",
            description = "Lists all analysis scan records that have run historically on a given repository configuration"
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of analyses retrieved successfully"
    )
    @GetMapping("/repository/{repositoryId}")
    public List<AnalysisResponse> getRepositoryAnalyses(
            @PathVariable Long repositoryId
    ) {

        return analysisService.getRepositoryAnalyses(repositoryId)
                .stream()
                .map(analysisMapper::toResponse)
                .toList();
    }

    @Operation(
            summary = "Get list of issues detected by an analysis run",
            description = "Returns all security vulnerabilities, design issues, and linting recommendations generated from a specific scan run"
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of scan issues retrieved successfully"
    )
    @GetMapping("/{analysisId}/issues")
    public List<IssueResponse> getAnalysisIssues(
            @PathVariable Long analysisId
    ) {

        return analysisService.getAnalysisIssues(analysisId)
                .stream()
                .map(issueMapper::toIssueResponse)
                .toList();
    }
}