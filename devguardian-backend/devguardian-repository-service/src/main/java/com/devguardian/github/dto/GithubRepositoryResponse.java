package com.devguardian.github.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GithubRepositoryResponse {

    private Long id;

    private String name;

    @JsonProperty("full_name")
    private String fullName;

    private Owner owner;

    @JsonProperty("private")
    private boolean isPrivate;

    @JsonProperty("html_url")
    private String htmlUrl;

    @JsonProperty("clone_url")
    private String cloneUrl;

    @JsonProperty("default_branch")
    private String defaultBranch;
    @Data
    public static class Owner {
        private String login;
    }
}