package com.devguardian.github.client;

import com.devguardian.github.config.GithubProperties;
import com.devguardian.github.dto.GithubAccessTokenResponse;
import com.devguardian.github.dto.GithubRepositoryResponse;
import com.devguardian.github.dto.GithubUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GithubApiClient {

    private final GithubProperties properties;

    private final RestClient authClient = RestClient.builder()
            .baseUrl("https://github.com")
            .build();

    private final RestClient apiClient = RestClient.builder()
            .baseUrl("https://api.github.com")
            .build();

    // =========================================
    // 1. Exchange Code → Access Token
    // =========================================
    public GithubAccessTokenResponse exchangeCodeForToken(String code) {

        return authClient.post()
                .uri("/login/oauth/access_token")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(java.util.Map.of(
                        "client_id", properties.getClientId(),
                        "client_secret", properties.getClientSecret(),
                        "code", code,
                        "redirect_uri", properties.getRedirectUri()
                ))
                .retrieve()
                .body(GithubAccessTokenResponse.class);
    }

    // =========================================
    // 2. Get GitHub User
    // =========================================
    public GithubUserResponse getCurrentUser(String accessToken) {

        return apiClient.get()
                .uri("/user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .retrieve()
                .body(GithubUserResponse.class);
    }

    // =========================================
    // 3. Get Repositories
    // =========================================
    public List<GithubRepositoryResponse> getUserRepositories(String accessToken) {

        GithubRepositoryResponse[] response = apiClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/user/repos")
                        .queryParam("sort", "updated")
                        .queryParam("per_page", 100)
                        .build())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .retrieve()
                .body(GithubRepositoryResponse[].class);

        if (response == null || response.length == 0) {
            return List.of();
        }

        return Arrays.asList(response);
    }
}