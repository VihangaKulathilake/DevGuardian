package com.devguardian.repository.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "devguardian.workspace")
public class WorkspaceProperties {

    private String basePath;
}