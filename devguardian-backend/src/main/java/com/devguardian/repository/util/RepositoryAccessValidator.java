package com.devguardian.repository.util;

import com.devguardian.auth.entity.User;
import com.devguardian.repository.entity.Repository;
import org.springframework.stereotype.Component;
import org.springframework.security.access.AccessDeniedException;


@Component
public class RepositoryAccessValidator {

    public void validateOwnership(
            Repository repository,
            User currentUser
    ) {

        if (!repository.getUser()
                .getId()
                .equals(currentUser.getId())) {throw new AccessDeniedException("You do not have permission to access this repository");
        }
    }
}
