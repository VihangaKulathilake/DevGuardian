package com.devguardian.security;

import com.devguardian.constants.Messages;
import com.devguardian.auth.entity.User;
import com.devguardian.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserUtil {

    private final UserRepository userRepository;

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new org.springframework.security.core.userdetails.UsernameNotFoundException(Messages.USER_NOT_FOUND));
    }
}
