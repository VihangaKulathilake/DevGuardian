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

    private static final Set<String> CONFIG_AND_SENSITIVE_EXTENSIONS = Set.of(
            ".properties",
            ".yml",
            ".yaml",
            ".xml",
            ".toml",
            ".ini",
            ".conf",
            ".cfg",
            ".json",
            ".pem",
            ".key",
            ".p12",
            ".pfx",
            ".jks",
            ".keystore",
            ".ppk",
            ".asc"
    );

    private static final Set<String> CONFIG_AND_SENSITIVE_EXACT_NAMES = Set.of(
            "credentials",
            ".git-credentials",
            ".netrc",
            ".npmrc",
            ".pypirc",
            ".htpasswd",
            ".boto",
            "id_rsa",
            "id_dsa",
            "id_ecdsa",
            "id_ed25519"
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

        String fileName = file.getFileName().toString();
        String lower = fileName.toLowerCase();

        // Skip hidden files, except for environment files (.env) or specified credentials/configs
        if (fileName.startsWith(".")) {
            if (!fileName.startsWith(".env") && !CONFIG_AND_SENSITIVE_EXACT_NAMES.contains(lower)) {
                return false;
            }
        }

        // Allow supported source files
        if (SUPPORTED_EXTENSIONS.stream().anyMatch(lower::endsWith)) {
            return true;
        }

        // Allow configuration and sensitive files by extension
        if (CONFIG_AND_SENSITIVE_EXTENSIONS.stream().anyMatch(lower::endsWith)) {
            return true;
        }

        // Allow environment files (.env*)
        if (lower.startsWith(".env")) {
            return true;
        }

        // Allow exact matching config/sensitive filenames
        return CONFIG_AND_SENSITIVE_EXACT_NAMES.contains(lower);
    }
}