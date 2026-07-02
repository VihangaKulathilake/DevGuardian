package com.devguardian.analysis.util;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class AnalysisAccessValidator {
    public void validateOwnership(Analysis analysis, Long currentUserId) {

        if (analysis == null) {
            throw new ResourceNotFoundException("Analysis not found");
        }

        if (analysis.getRepository() == null || analysis.getRepository().getUserId() == null) {
            throw new AccessDeniedException("You do not have permission to access this analysis");
        }

        Long ownerId = analysis.getRepository().getUserId();

        if (!ownerId.equals(currentUserId)) {
            throw new AccessDeniedException(
                    "You do not have permission to access this analysis"
            );
        }
    }
}