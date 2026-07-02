package com.devguardian.github.service.impl;

import com.devguardian.github.client.GithubApiClient;
import com.devguardian.github.config.GithubProperties;
import com.devguardian.github.dto.GithubAccessTokenResponse;
import com.devguardian.github.dto.GithubRepositoryResponse;
import com.devguardian.github.dto.GithubUserResponse;
import com.devguardian.github.entity.GithubConnection;
import com.devguardian.github.service.interfaces.GithubConnectionService;
import com.devguardian.github.service.interfaces.GithubOAuthService;
import com.devguardian.security.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GithubOAuthServiceImpl implements GithubOAuthService {

    private final GithubApiClient githubApiClient;
    private final GithubConnectionService githubConnectionService;
    private final GithubProperties githubProperties;
    private final CurrentUserUtil currentUserUtil;

    @Override
    public String generateAuthorizationUrl(String state) {

        return UriComponentsBuilder
                .fromHttpUrl("https://github.com/login/oauth/authorize")
                .queryParam("client_id", githubProperties.getClientId())
                .queryParam("redirect_uri", githubProperties.getRedirectUri())
                .queryParam("scope", "repo read:user")
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    @Override
    public void processCallback(String code, String state) {

        // Parse user ID from the state parameter
        Long userId = Long.parseLong(state);

        // 1. Exchange authorization code for access token
        GithubAccessTokenResponse tokenResponse =
                githubApiClient.exchangeCodeForToken(code);

        if (tokenResponse == null ||
                tokenResponse.getAccessToken() == null) {

            throw new RuntimeException(
                    "Failed to obtain GitHub access token"
            );
        }

        String accessToken = tokenResponse.getAccessToken();

        // 2. Fetch GitHub profile
        GithubUserResponse githubUser =
                githubApiClient.getCurrentUser(accessToken);

        if (githubUser == null) {
            throw new RuntimeException(
                    "Failed to fetch GitHub user profile"
            );
        }

        // 3. Build connection entity
        GithubConnection connection = GithubConnection.builder()
                .userId(userId)
                .githubUserId(githubUser.getId())
                .githubUsername(githubUser.getLogin())
                .githubEmail(githubUser.getEmail())
                .accessToken(accessToken)
                .tokenType(tokenResponse.getTokenType())
                .scope(tokenResponse.getScope())
                .status(com.devguardian.github.enums.ConnectionStatus.ACTIVE)
                .connectedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // 4. Save connection
        githubConnectionService.saveConnection(connection);
    }

    @Override
    public List<GithubRepositoryResponse> getRepositories() {

        // 2. Get GitHub connection from DB
        GithubConnection connection =
                githubConnectionService.getCurrentUserConnection();

        // 3. Call GitHub API using stored token
        List<GithubRepositoryResponse> response =
                githubApiClient.getUserRepositories(connection.getAccessToken());

        // 4. Convert to list safely
        if (response == null || response.isEmpty()) {
            return List.of();
        }

        return response;
    }
}