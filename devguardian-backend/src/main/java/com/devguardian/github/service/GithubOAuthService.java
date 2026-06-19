package com.devguardian.github.service;

import com.devguardian.auth.entity.User;

public interface GithubOAuthService {

    String generateAuthorizationUrl(String state);

    void processCallback(String code, String state);
}