package com.devguardian.github.controller;

import com.devguardian.github.dto.GithubRepositoryResponse;
import com.devguardian.github.service.interfaces.GithubConnectionService;
import com.devguardian.github.service.interfaces.GithubOAuthService;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.config.StandardErrorResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Tag(
        name = "GitHub Integration APIs",
        description = "Endpoints for OAuth2 connection, repository listing, and synchronization with GitHub"
)
@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@StandardErrorResponses
public class GithubController {

    private final GithubOAuthService githubOAuthService;
    private final GithubConnectionService githubConnectionService;
    private final CurrentUserUtil currentUserUtil;

    @Operation(
            summary = "Initiate GitHub OAuth Connection",
            description = "Generates and returns the GitHub OAuth authorization URL to redirect the user to"
    )
    @ApiResponse(
            responseCode = "200",
            description = "OAuth authorization URL successfully generated"
    )
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/connect")
    public ResponseEntity<String> connect() {

        String email = currentUserUtil.getCurrentUser().getEmail();
        String authorizationUrl =
                githubOAuthService.generateAuthorizationUrl(email);

        return ResponseEntity.ok(authorizationUrl);
    }

    @Operation(
            summary = "GitHub OAuth Callback handler",
            description = "Processes the temporary code returned by GitHub, exchanges it for an access token, and links the account"
    )
    @ApiResponse(
            responseCode = "302",
            description = "GitHub account connected successfully, redirecting to frontend repositories page"
    )
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam String code,
            @RequestParam String state) {

        githubOAuthService.processCallback(code, state);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("http://localhost:3000/repositories"))
                .build();
    }

    @Operation(
            summary = "Retrieve connected GitHub repositories",
            description = "Fetches the list of all available repositories for the connected GitHub account"
    )
    @ApiResponse(
            responseCode = "200",
            description = "GitHub repositories retrieved successfully"
    )
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/repositories")
    public ResponseEntity<List<GithubRepositoryResponse>> getRepositories() {

        return ResponseEntity.ok(
                githubOAuthService.getRepositories()
        );
    }

    @Operation(
            summary = "Disconnect GitHub integration",
            description = "Removes the user's linked GitHub account and revokes access token reference"
    )
    @ApiResponse(
            responseCode = "200",
            description = "GitHub account disconnected successfully"
    )
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/disconnect")
    public ResponseEntity<String> disconnect() {

        githubConnectionService.disconnectCurrentUser();

        return ResponseEntity.ok(
                "GitHub disconnected successfully"
        );
    }
}