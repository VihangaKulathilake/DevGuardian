package com.devguardian.auth.service.interfaces;

import com.devguardian.auth.dto.GoogleUserInfo;

public interface GoogleOAuthService {
    GoogleUserInfo verifyToken(String idToken);
}

