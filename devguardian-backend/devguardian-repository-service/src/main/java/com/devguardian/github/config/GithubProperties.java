package com.devguardian.github.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "github")
public class GithubProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;

    private String authUrl = "https://github.com/login/oauth";
    private String apiUrl = "https://api.github.com";
}