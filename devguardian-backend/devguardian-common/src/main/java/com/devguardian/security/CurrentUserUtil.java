package com.devguardian.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserUtil {

    public StatelessUser getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof StatelessUser) {
            return (StatelessUser) authentication.getPrincipal();
        }
        return null;
    }
}
