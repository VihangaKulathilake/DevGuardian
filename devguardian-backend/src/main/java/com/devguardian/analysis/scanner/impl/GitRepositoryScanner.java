package com.devguardian.analysis.scanner.impl;

import com.devguardian.analysis.discovery.FileFilterService;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.repository.config.WorkspaceProperties;
import com.devguardian.repository.entity.Repository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import jakarta.validation.constraints.NotNull;
import java.io.File;
import java.io.IOException;
import java.net.URI;
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
    public ScanContext scan(Repository repository) {

        Map<String, String> files = new HashMap<>();
        Map<String, Long> fileSizes = new HashMap<>();

        String repositoryPath = buildRepositoryPath(repository);

        Path rootDirectory = Path.of(repositoryPath);

        if (!Files.exists(rootDirectory)) {
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
                                return;
                            }

                            String content =
                                    Files.readString(
                                            path,
                                            StandardCharsets.UTF_8
                                    );

                            String relativePath = rootDirectory
                                            .relativize(path)
                                            .toString();

                            files.put(
                                    relativePath,
                                    content
                            );

                            fileSizes.put(
                                    relativePath,
                                    size
                            );

                        } catch (IOException ex) {

                            log.debug(
                                    "Skipping file {} because {}",
                                    path,
                                    ex.getMessage()
                            );
                        }
                    });

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to scan repository files",
                    ex
            );
        }

        log.info(
                "Scanned {} files from repository {}",
                files.size(),
                repository.getFullName()
        );

        return new ScanContext(
                repository,
                files,
                fileSizes
        );
    }

    private String buildRepositoryPath(
            Repository repository
    ) {

        return workspaceProperties.getBasePath()
                + File.separator
                + repository.getUser().getId()
                + File.separator
                + repository.getId()
                + File.separator
                + "source";
    }
}