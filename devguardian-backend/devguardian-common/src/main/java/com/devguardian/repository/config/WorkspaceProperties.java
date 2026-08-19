package com.devguardian.repository.config;

import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.File;

@Setter
@Slf4j
@ConfigurationProperties(prefix = "devguardian.workspace")
public class WorkspaceProperties {

    private String basePath;

    public String getBasePath() {
        return getResolvedBasePath();
    }

    public String getResolvedBasePath() {
        String configured = (basePath != null && !basePath.isBlank()) ? basePath.trim() : "workspace/repos";

        File file = new File(configured);
        if (file.isAbsolute()) {
            return file.getAbsolutePath();
        }

        // If configured path already exists relative to current working dir, use it
        if (file.exists()) {
            return file.getAbsolutePath();
        }

        // Check common relative paths in DevGuardian project hierarchy
        String[] candidates = {
                configured,
                "workspace/repos",
                "../workspace/repos",
                "devguardian-backend/workspace/repos",
                "../devguardian-backend/workspace/repos",
                "../../workspace/repos"
        };

        for (String candidate : candidates) {
            File candFile = new File(candidate);
            if (candFile.exists() && candFile.isDirectory()) {
                return candFile.getAbsolutePath();
            }
        }

        // If none of the candidate folders exist yet, determine best location based on working directory:
        File userDir = new File(System.getProperty("user.dir", "."));
        // Case 1: user.dir is inside a submodule (e.g. devguardian-backend/devguardian-analysis-service)
        if (userDir.getName().startsWith("devguardian-") && userDir.getParentFile() != null) {
            File parentWorkspace = new File(userDir.getParentFile(), "workspace/repos");
            return parentWorkspace.getAbsolutePath();
        }

        // Case 2: user.dir is devguardian-backend
        if (userDir.getName().equals("devguardian-backend") || new File(userDir, "devguardian-analysis-service").exists()) {
            File backendWorkspace = new File(userDir, "workspace/repos");
            return backendWorkspace.getAbsolutePath();
        }

        // Case 3: user.dir is project root (DevGuardian)
        if (new File(userDir, "devguardian-backend").exists()) {
            File backendWorkspace = new File(userDir, "devguardian-backend/workspace/repos");
            return backendWorkspace.getAbsolutePath();
        }

        return file.getAbsolutePath();
    }
}