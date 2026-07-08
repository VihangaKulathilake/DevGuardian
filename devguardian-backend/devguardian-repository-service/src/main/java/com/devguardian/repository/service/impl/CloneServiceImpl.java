package com.devguardian.repository.service.impl;

import com.devguardian.github.entity.GithubConnection;
import com.devguardian.repository.config.WorkspaceProperties;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.service.interfaces.CloneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

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

        try {

            String targetPath = buildRepositoryPath(repository);

            File directory = new File(targetPath);

            // Cache hit
            if (directory.exists()
                    && directory.isDirectory()
                    && directory.list() != null
                    && directory.list().length > 0) {

                log.info(
                        "Repository already exists locally. Using cache: {}",
                        targetPath
                );

                return targetPath;
            }

            Files.createDirectories(Path.of(targetPath));

            log.info(
                    "Cloning repository {} into {}",
                    repository.getFullName(),
                    targetPath
            );

            org.eclipse.jgit.api.CloneCommand cloneCommand = Git.cloneRepository()
                    .setURI(repository.getCloneUrl())
                    .setDirectory(directory);

            if (repository.getBranch() != null && !repository.getBranch().isBlank()) {
                cloneCommand.setBranch(repository.getBranch());
            }

            if (githubConnection != null && githubConnection.getAccessToken() != null && !githubConnection.getAccessToken().isBlank()) {
                cloneCommand.setCredentialsProvider(
                        new UsernamePasswordCredentialsProvider(
                                githubConnection.getAccessToken(),
                                ""
                        )
                );
            }

            cloneCommand.call();

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

            throw new RuntimeException(
                    "Failed to clone repository: "
                            + repository.getFullName(),
                    ex
            );
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