package com.devguardian.auth.service.impl;

import com.devguardian.auth.dto.GoogleUserInfo;
import com.devguardian.auth.service.interfaces.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthServiceImpl implements GoogleOAuthService {

    private final RestTemplate restTemplate;

    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @Override
    public GoogleUserInfo verifyToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new BadCredentialsException("Google ID token is required");
        }

        try {
            String url = GOOGLE_TOKENINFO_URL + idToken.trim();
            GoogleUserInfo userInfo = restTemplate.getForObject(url, GoogleUserInfo.class);

            if (userInfo == null || userInfo.getEmail() == null) {
                throw new BadCredentialsException("Invalid Google token payload");
            }

            if ("false".equalsIgnoreCase(userInfo.getEmailVerified())) {
                throw new BadCredentialsException("Google email address is not verified");
            }

            return userInfo;
        } catch (Exception e) {
            log.error("Failed to verify Google ID token: {}", e.getMessage());
            throw new BadCredentialsException("Invalid or expired Google authentication token");
        }
    }
}

