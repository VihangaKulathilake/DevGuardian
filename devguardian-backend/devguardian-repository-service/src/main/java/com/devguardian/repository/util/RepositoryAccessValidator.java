package com.devguardian.repository.util;

import com.devguardian.repository.entity.Repository;
import org.springframework.stereotype.Component;
import org.springframework.security.access.AccessDeniedException;

@Component
public class RepositoryAccessValidator {

    public void validateOwnership(
            Repository repository,
            Long currentUserId
    ) {

        if (repository.getUserId() == null ||
                !repository.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not have permission to access this repository");
        }
    }
}
