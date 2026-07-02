package com.devguardian.analysis.util;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.client.RepositoryClient;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AnalysisAccessValidator {

    private final RepositoryClient repositoryClient;

    public void validateOwnership(Analysis analysis, Long currentUserId) {

        if (analysis == null) {
            throw new ResourceNotFoundException("Analysis not found");
        }

        RepositoryResponse repository = repositoryClient.getRepository(analysis.getRepositoryId());
        if (repository == null || repository.getUserId() == null) {
            throw new AccessDeniedException("You do not have permission to access this analysis");
        }

        Long ownerId = repository.getUserId();

        if (!ownerId.equals(currentUserId)) {
            throw new AccessDeniedException(
                    "You do not have permission to access this analysis"
            );
        }
    }
}