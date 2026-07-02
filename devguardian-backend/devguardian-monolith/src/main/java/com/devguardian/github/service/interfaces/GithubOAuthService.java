package com.devguardian.github.service.interfaces;

import com.devguardian.github.dto.GithubRepositoryResponse;

import java.util.List;

public interface GithubOAuthService {

    String generateAuthorizationUrl(String state);

    void processCallback(String code, String state);

    List<GithubRepositoryResponse> getRepositories();
}