package com.devguardian.analysis.util;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.auth.entity.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class AnalysisAccessValidator {
    public void validateOwnership(Analysis analysis, User currentUser) {

        if (analysis == null) {
            throw new EntityNotFoundException("Analysis not found");
        }

        Long ownerId = analysis.getRepository()
                .getUser()
                .getId();

        if (!ownerId.equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You do not have permission to access this analysis"
            );
        }
    }
}