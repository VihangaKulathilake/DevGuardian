package com.devguardian.auth.service.impl;

import com.devguardian.auth.dto.AsgardeoAuthRequest;
import com.devguardian.auth.dto.AsgardeoUserInfo;
import com.devguardian.auth.service.interfaces.AsgardeoOAuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsgardeoOAuthServiceImpl implements AsgardeoOAuthService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${asgardeo.client-id:q3hG34FWufohAl2f39sWw7ZsimYa}")
    private String clientId;

    @Value("${asgardeo.client-secret:JLA7txbgGKSpakVpbQz_eeZfW73fdaftBd8pt7CD9Mwa}")
    private String clientSecret;

    @Value("${asgardeo.base-url:https://api.asgardeo.io/t/orge1hf1}")
    private String baseUrl;

    @Override
    public AsgardeoUserInfo getUserInfo(AsgardeoAuthRequest request) {
        if (request == null) {
            throw new BadCredentialsException("Asgardeo authentication request is empty");
        }

        try {
            // Flow A: Authorization Code Exchange (Recommended PKCE / OIDC flow)
            if (request.getCode() != null && !request.getCode().isBlank()) {
                return exchangeCodeForUserInfo(request);
            }

            // Flow B: Direct ID Token validation
            if (request.getIdToken() != null && !request.getIdToken().isBlank()) {
                return parseIdToken(request.getIdToken());
            }

            throw new BadCredentialsException("Neither authorization code nor ID token was provided");
        } catch (BadCredentialsException bce) {
            throw bce;
        } catch (Exception e) {
            log.error("Failed to authenticate with Asgardeo: {}", e.getMessage());
            throw new BadCredentialsException("Asgardeo authentication failed: " + e.getMessage());
        }
    }

    private AsgardeoUserInfo exchangeCodeForUserInfo(AsgardeoAuthRequest request) {
        String tokenUrl = baseUrl.replaceAll("/+$", "") + "/oauth2/token";
        String userInfoUrl = baseUrl.replaceAll("/+$", "") + "/oauth2/userinfo";

        ResponseEntity<String> tokenResponse = executeTokenExchange(
                tokenUrl,
                request.getCode().trim(),
                request.getRedirectUri() != null ? request.getRedirectUri().trim() : null,
                request.getCodeVerifier() != null ? request.getCodeVerifier().trim() : null
        );

        if (tokenResponse == null || !tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
            throw new BadCredentialsException("Failed to obtain access token from Asgardeo");
        }

        try {
            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.has("access_token") ? tokenJson.get("access_token").asText() : null;
            String idToken = tokenJson.has("id_token") ? tokenJson.get("id_token").asText() : null;

            log.info("Asgardeo token exchange successful. Has accessToken: {}, has idToken: {}", 
                    accessToken != null, idToken != null);

            // Step 1: Query userinfo endpoint with bearer access token
            if (accessToken != null && !accessToken.isBlank()) {
                HttpHeaders userHeaders = new HttpHeaders();
                userHeaders.setBearerAuth(accessToken);
                HttpEntity<Void> userEntity = new HttpEntity<>(userHeaders);

                try {
                    ResponseEntity<AsgardeoUserInfo> userResponse = restTemplate.exchange(
                            userInfoUrl,
                            HttpMethod.GET,
                            userEntity,
                            AsgardeoUserInfo.class
                    );

                    if (userResponse.getStatusCode().is2xxSuccessful() && userResponse.getBody() != null) {
                        AsgardeoUserInfo info = userResponse.getBody();
                        if (info.getEmail() != null || info.getUsername() != null || info.getSub() != null) {
                            log.info("Successfully retrieved user profile from Asgardeo userinfo endpoint");
                            return info;
                        }
                    }
                } catch (Exception userEx) {
                    log.warn("Asgardeo userinfo endpoint returned error, falling back to id_token claims: {}", userEx.getMessage());
                }
            }

            // Step 2: Fallback to decoding ID token claims if userinfo is unavailable
            if (idToken != null && !idToken.isBlank()) {
                return parseIdToken(idToken);
            }
        } catch (Exception e) {
            log.error("Error parsing Asgardeo token/userinfo response: {}", e.getMessage());
            throw new BadCredentialsException("Failed to parse Asgardeo identity response");
        }

        throw new BadCredentialsException("Could not retrieve user profile from Asgardeo");
    }

    private ResponseEntity<String> executeTokenExchange(String tokenUrl, String code, String redirectUri, String codeVerifier) {
        // Strategy 1: Client Secret Post (Credentials in Body)
        if (clientSecret != null && !clientSecret.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
                params.add("grant_type", "authorization_code");
                params.add("client_id", clientId.trim());
                params.add("client_secret", clientSecret.trim());
                params.add("code", code);
                if (redirectUri != null) params.add("redirect_uri", redirectUri);
                if (codeVerifier != null && !codeVerifier.isBlank()) params.add("code_verifier", codeVerifier);

                log.info("Attempting Asgardeo token exchange with Strategy 1 (Client Secret Post)...");
                ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, new HttpEntity<>(params, headers), String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response;
                }
            } catch (Exception ex) {
                log.warn("Strategy 1 (Client Secret Post) failed: {}", ex.getMessage());
            }

            // Strategy 2: Client Secret Basic (HTTP Basic Auth Header)
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                headers.setBasicAuth(clientId.trim(), clientSecret.trim());

                MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
                params.add("grant_type", "authorization_code");
                params.add("code", code);
                if (redirectUri != null) params.add("redirect_uri", redirectUri);
                if (codeVerifier != null && !codeVerifier.isBlank()) params.add("code_verifier", codeVerifier);

                log.info("Attempting Asgardeo token exchange with Strategy 2 (Basic Auth Header)...");
                ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, new HttpEntity<>(params, headers), String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response;
                }
            } catch (Exception ex) {
                log.warn("Strategy 2 (Basic Auth Header) failed: {}", ex.getMessage());
            }
        }

        // Strategy 3: Public Client (PKCE only in Body)
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId.trim());
            params.add("code", code);
            if (redirectUri != null) params.add("redirect_uri", redirectUri);
            if (codeVerifier != null && !codeVerifier.isBlank()) params.add("code_verifier", codeVerifier);

            log.info("Attempting Asgardeo token exchange with Strategy 3 (Public Client PKCE)...");
            return restTemplate.postForEntity(tokenUrl, new HttpEntity<>(params, headers), String.class);
        } catch (HttpStatusCodeException httpEx) {
            log.error("All token exchange strategies failed. Final response [HTTP {}]: {}", 
                    httpEx.getStatusCode(), httpEx.getResponseBodyAsString());
            throw new BadCredentialsException("Asgardeo token exchange failed: " + httpEx.getResponseBodyAsString());
        } catch (Exception ex) {
            log.error("All token exchange strategies failed: {}", ex.getMessage());
            throw new BadCredentialsException("Asgardeo connection failed: " + ex.getMessage());
        }
    }

    private AsgardeoUserInfo parseIdToken(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length >= 2) {
                String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
                JsonNode json = objectMapper.readTree(payload);

                String sub = json.has("sub") ? json.get("sub").asText() : null;
                String email = json.has("email") ? json.get("email").asText() : (json.has("username") ? json.get("username").asText() : null);
                String givenName = json.has("given_name") ? json.get("given_name").asText() : null;
                String familyName = json.has("family_name") ? json.get("family_name").asText() : null;
                String name = json.has("name") ? json.get("name").asText() : (givenName != null ? givenName : email);

                return AsgardeoUserInfo.builder()
                        .sub(sub)
                        .email(email)
                        .givenName(givenName)
                        .familyName(familyName)
                        .name(name)
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to parse Asgardeo ID token claims: {}", e.getMessage());
        }
        throw new BadCredentialsException("Invalid Asgardeo ID token");
    }
}
