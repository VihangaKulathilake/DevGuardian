package com.devguardian.github.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GithubUserResponse {

    private Long id;

    private String login;

    private String email;

    @JsonProperty("avatar_url")
    private String avatarUrl;
}