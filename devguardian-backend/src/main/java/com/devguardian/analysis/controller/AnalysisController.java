package com.devguardian.analysis.controller;

import com.devguardian.analysis.dto.response.AnalysisResponse;
import com.devguardian.analysis.dto.response.IssueResponse;
import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.mapper.AnalysisMapper;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;
    private final AnalysisMapper analysisMapper;

    /*
     * Start repository analysis
     */
    @PostMapping("/{repositoryId}/start")
    @ResponseStatus(HttpStatus.CREATED)
    public AnalysisResponse startAnalysis(
            @PathVariable Long repositoryId
    ) {

        Analysis analysis = analysisService.startAnalysis(repositoryId);

        return analysisMapper.toResponse(analysis);
    }

    @GetMapping("/{analysisId}")
    public AnalysisResponse getAnalysis(
            @PathVariable Long analysisId
    ) {

        Analysis analysis = analysisService.getAnalysisById(analysisId);

        return analysisMapper.toResponse(analysis);
    }

    @GetMapping("/repository/{repositoryId}")
    public List<AnalysisResponse> getRepositoryAnalyses(
            @PathVariable Long repositoryId
    ) {

        return analysisService.getRepositoryAnalyses(repositoryId)
                .stream()
                .map(analysisMapper::toResponse)
                .toList();
    }

    @GetMapping("/{analysisId}/issues")
    public List<IssueResponse> getAnalysisIssues(
            @PathVariable Long analysisId
    ) {

        return analysisService.getAnalysisIssues(analysisId)
                .stream()
                .map(analysisMapper::toIssueResponse)
                .toList();
    }
}