package com.devguardian.auth.service.interfaces;

import com.devguardian.auth.dto.AsgardeoAuthRequest;
import com.devguardian.auth.dto.AsgardeoUserInfo;

public interface AsgardeoOAuthService {
    AsgardeoUserInfo getUserInfo(AsgardeoAuthRequest request);
}

