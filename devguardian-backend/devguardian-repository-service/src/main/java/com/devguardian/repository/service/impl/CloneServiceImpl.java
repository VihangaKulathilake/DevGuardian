package com.devguardian.repository.service.impl;

import com.devguardian.github.entity.GithubConnection;
import com.devguardian.repository.config.WorkspaceProperties;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.service.interfaces.CloneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloneServiceImpl implements CloneService {

    private final WorkspaceProperties workspaceProperties;

    @Override
    public String cloneRepository(
            Repository repository,
            GithubConnection githubConnection
    ) {
        String targetPath = buildRepositoryPath(repository);
        File directory = new File(targetPath);

        try {
            // Verify if directory is an intact git repository cache
            if (directory.exists() && directory.isDirectory()) {
                File gitDir = new File(directory, ".git");
                File[] contents = directory.listFiles();
                if (gitDir.exists() && contents != null && contents.length > 1) {
                    log.info(
                            "Repository already exists locally. Using cache: {}",
                            targetPath
                    );
                    return targetPath;
                } else {
                    log.warn("Directory {} exists but is incomplete or invalid. Cleaning up...", targetPath);
                    deleteDirectory(directory);
                }
            }

            Files.createDirectories(Path.of(targetPath).getParent());

            log.info(
                    "Cloning repository {} into {}",
                    repository.getFullName(),
                    targetPath
            );

            String cloneUrl = repository.getCloneUrl() != null ? repository.getCloneUrl().trim() : "";
            if (cloneUrl.isBlank()) {
                throw new IllegalArgumentException("Repository clone URL cannot be empty");
            }

            boolean branchSpecified = repository.getBranch() != null && !repository.getBranch().isBlank();
            boolean hasCredentials = githubConnection != null && githubConnection.getAccessToken() != null && !githubConnection.getAccessToken().isBlank();

            try {
                // Attempt 1: Clone with specified branch and credentials (if available)
                performClone(cloneUrl, directory, branchSpecified ? repository.getBranch().trim() : null, hasCredentials ? githubConnection.getAccessToken() : null);
            } catch (Exception ex1) {
                log.warn("Initial clone attempt failed for {}: {}. Attempting fallback strategies...", repository.getFullName(), ex1.getMessage());
                deleteDirectory(directory);

                // Fallback 1: If branch was specified, try cloning default branch without setBranch
                if (branchSpecified) {
                    try {
                        log.info("Retrying clone for {} without explicit branch parameter...", repository.getFullName());
                        performClone(cloneUrl, directory, null, hasCredentials ? githubConnection.getAccessToken() : null);
                    } catch (Exception ex2) {
                        deleteDirectory(directory);
                        // Fallback 2: If credentials were provided, retry anonymously (public repository fallback)
                        if (hasCredentials) {
                            log.info("Retrying clone for {} anonymously without credentials...", repository.getFullName());
                            performClone(cloneUrl, directory, null, null);
                        } else {
                            throw ex2;
                        }
                    }
                } else if (hasCredentials) {
                    // Fallback 2: Retry anonymously (public repository fallback)
                    log.info("Retrying clone for {} anonymously without credentials...", repository.getFullName());
                    performClone(cloneUrl, directory, null, null);
                } else {
                    throw ex1;
                }
            }

            log.info(
                    "Repository cloned successfully: {}",
                    repository.getFullName()
            );

            return targetPath;

        } catch (Exception ex) {
            log.error(
                    "Failed to clone repository {}",
                    repository.getFullName(),
                    ex
            );

            // Clean up failed clone folder so future attempts are clean
            deleteDirectory(directory);

            throw new RuntimeException(
                    "Failed to clone repository: "
                            + repository.getFullName() + ". " + ex.getMessage(),
                    ex
            );
        }
    }

    private void performClone(String url, File directory, String branch, String accessToken) throws GitAPIException {
        org.eclipse.jgit.api.CloneCommand cloneCommand = Git.cloneRepository()
                .setURI(url)
                .setDirectory(directory)
                .setDepth(1)
                .setTimeout(120)
                .setCloneSubmodules(false);

        if (branch != null && !branch.isBlank()) {
            cloneCommand.setBranch(branch);
        }

        if (accessToken != null && !accessToken.isBlank()) {
            cloneCommand.setCredentialsProvider(
                    new UsernamePasswordCredentialsProvider(accessToken, "")
            );
        }

        cloneCommand.call();
    }

    private void deleteDirectory(File dir) {
        if (dir == null || !dir.exists()) {
            return;
        }
        try {
            Files.walkFileTree(dir.toPath(), new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    try {
                        file.toFile().setWritable(true);
                        Files.deleteIfExists(file);
                    } catch (Exception ignored) {
                        file.toFile().delete();
                    }
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dirPath, IOException exc) throws IOException {
                    try {
                        dirPath.toFile().setWritable(true);
                        Files.deleteIfExists(dirPath);
                    } catch (Exception ignored) {
                        dirPath.toFile().delete();
                    }
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (Exception e) {
            log.warn("Failed to cleanly delete directory {}: {}", dir.getAbsolutePath(), e.getMessage());
        }
    }

    private String buildRepositoryPath(Repository repository) {

        return workspaceProperties.getBasePath()
                + File.separator
                + repository.getUserId()
                + File.separator
                + repository.getId()
                + File.separator
                + "source";
    }
}