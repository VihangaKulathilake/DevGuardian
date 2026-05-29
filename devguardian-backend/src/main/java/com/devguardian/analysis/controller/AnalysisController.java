package com.devguardian.analysis.controller;

import com.devguardian.analysis.dto.response.AnalysisResponse;
import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.mapper.AnalysisMapper;
import com.devguardian.analysis.service.interfaces.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
}