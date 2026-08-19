package com.devguardian.analysis.scanner.impl;

import com.devguardian.analysis.discovery.FileFilterService;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.repository.config.WorkspaceProperties;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.enums.RepositoryProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
@Slf4j
public class GitRepositoryScanner implements RepositoryScanner {

    private final WorkspaceProperties workspaceProperties;
    private final FileFilterService fileFilterService;
    private static final long MAX_FILE_SIZE = 1024 * 1024;

    @Override
    public ScanContext scan(RepositoryResponse repository) {

        Map<String, String> files = new HashMap<>();
        Map<String, Long> fileSizes = new HashMap<>();

        String repositoryPath = repository.getProvider() == RepositoryProvider.LOCAL
                ? repository.getUrl()
                : buildRepositoryPath(repository);

        Path rootDirectory = resolveRepositoryDirectory(repository, repositoryPath);

        if (rootDirectory == null || !Files.exists(rootDirectory)) {
            log.error("Repository source directory not found for repo ID {}. Tried path: {}", repository.getId(), repositoryPath);
            throw new RuntimeException(
                    "Repository source directory not found: "
                            + repositoryPath
            );
        }

        try (Stream<java.nio.file.Path> pathStream =
                     Files.walk(rootDirectory)) {

            pathStream
                    .filter(Files::isRegularFile)
                    .filter(fileFilterService::shouldScan)
                    .forEach(path -> {

                        try {
                            /*
                             * Skip large files
                             */
                            long size = Files.size(path);

                            if (size > MAX_FILE_SIZE) {
                                log.warn(
                                        "Skipping large file: {} ({} bytes)",
                                        path.getFileName(),
                                        size
                                );
                                return;
                            }

                            String relativePath =
                                    rootDirectory.relativize(path).toString().replace('\\', '/');

                            String content =
                                    Files.readString(path, StandardCharsets.UTF_8);

                            files.put(relativePath, content);
                            fileSizes.put(relativePath, size);

                        } catch (IOException e) {
                            log.error(
                                    "Failed to read file content: {}",
                                    path.getFileName(),
                                    e
                            );
                        }
                    });

        } catch (IOException ex) {
            log.error(
                    "Failed to traverse directory: {}",
                    rootDirectory,
                    ex
            );
        }

        return new ScanContext(
                repository,
                files,
                fileSizes
        );
    }

    private Path resolveRepositoryDirectory(RepositoryResponse repository, String repositoryPath) {
        if (repositoryPath != null && !repositoryPath.isBlank()) {
            try {
                Path directPath = Path.of(repositoryPath);
                if (Files.exists(directPath) && Files.isDirectory(directPath)) {
                    return directPath;
                }
            } catch (Exception ignored) {}
        }

        // Try candidate workspace roots
        String relativeSuffix = repository.getUserId() + File.separator + repository.getId() + File.separator + "source";
        String[] candidateBases = {
                workspaceProperties.getBasePath(),
                workspaceProperties.getResolvedBasePath(),
                "workspace/repos",
                "../workspace/repos",
                "devguardian-backend/workspace/repos",
                "../devguardian-backend/workspace/repos",
                "../../workspace/repos"
        };

        for (String base : candidateBases) {
            if (base != null && !base.isBlank()) {
                try {
                    Path candPath = Path.of(base, relativeSuffix);
                    if (Files.exists(candPath) && Files.isDirectory(candPath)) {
                        log.info("Resolved repository source directory at candidate path: {}", candPath.toAbsolutePath());
                        return candPath;
                    }
                } catch (Exception ignored) {}
            }
        }

        // If local provider and URL points to an absolute or relative directory on disk
        if (repository.getUrl() != null && !repository.getUrl().isBlank()) {
            try {
                Path urlPath = Path.of(repository.getUrl());
                if (Files.exists(urlPath) && Files.isDirectory(urlPath)) {
                    return urlPath;
                }
            } catch (Exception ignored) {}
        }

        return null;
    }

    private String buildRepositoryPath(
            RepositoryResponse repository
    ) {

        return workspaceProperties.getBasePath()
                + File.separator
                + repository.getUserId()
                + File.separator
                + repository.getId()
                + File.separator
                + "source";
    }
}