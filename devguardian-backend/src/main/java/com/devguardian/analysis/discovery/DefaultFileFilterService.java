package com.devguardian.analysis.discovery;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

@Service
public class DefaultFileFilterService implements FileFilterService {

    private static final Set<String> IGNORED_DIRECTORIES = Set.of(
            ".git",
            ".github",
            ".idea",
            ".vscode",
            "node_modules",
            "target",
            "build",
            "dist",
            "out",
            "bin",
            "coverage",
            ".gradle",
            ".next",
            ".cache",
            "vendor"
    );

    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of(
            ".java",
            ".js",
            ".ts",
            ".jsx",
            ".tsx",
            ".py",
            ".php",
            ".cs",
            ".go",
            ".kt",
            ".kts",
            ".rb",
            ".rs",
            ".swift",
            ".c",
            ".cpp",
            ".h"
    );

    @Override
    public boolean shouldScan(Path file) {

        String normalized = file.toString().replace("\\", "/");

        // Skip ignored directories
        for (String dir : IGNORED_DIRECTORIES) {

            if (normalized.contains("/" + dir + "/")) {
                return false;
            }

        }

        // Skip hidden files
        if (file.getFileName().toString().startsWith(".")) {
            return false;
        }

        String lower = file.getFileName().toString().toLowerCase();

        // Only allow supported source files
        return SUPPORTED_EXTENSIONS.stream()
                .anyMatch(lower::endsWith);
    }
}