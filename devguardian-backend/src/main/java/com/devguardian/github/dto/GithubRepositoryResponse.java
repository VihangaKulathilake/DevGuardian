package com.devguardian.github.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GithubRepositoryResponse {

    private Long id;

    private String name;

    @JsonProperty("full_name")
    private String fullName;

    private boolean privateRepo;

    @JsonProperty("html_url")
    private String htmlUrl;
}