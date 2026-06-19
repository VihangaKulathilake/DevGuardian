package com.devguardian.github.service.impl;

import com.devguardian.auth.entity.User;
import com.devguardian.github.client.GithubApiClient;
import com.devguardian.github.config.GithubProperties;
import com.devguardian.github.dto.GithubAccessTokenResponse;
import com.devguardian.github.dto.GithubUserResponse;
import com.devguardian.github.entity.GithubConnection;
import com.devguardian.github.service.GithubConnectionService;
import com.devguardian.github.service.GithubOAuthService;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class GithubOAuthServiceImpl implements GithubOAuthService {

    private final GithubApiClient githubApiClient;
    private final GithubConnectionService githubConnectionService;
    private final GithubProperties githubProperties;
    private final CurrentUserUtil currentUserUtil;
    private final UserRepository userRepository;

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

        // Find user by email passed in state
        User currentUser = userRepository.findByEmail(state)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + state));

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
                .user(currentUser)
                .githubUserId(githubUser.getId())
                .githubUsername(githubUser.getLogin())
                .githubEmail(githubUser.getEmail())
                .accessToken(accessToken)
                .tokenType(tokenResponse.getTokenType())
                .scope(tokenResponse.getScope())
                .build();

        // 4. Save connection
        githubConnectionService.saveConnection(connection);
    }
}