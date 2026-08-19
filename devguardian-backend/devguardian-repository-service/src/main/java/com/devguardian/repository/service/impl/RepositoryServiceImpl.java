package com.devguardian.repository.service.impl;

import com.devguardian.constants.Messages;
import com.devguardian.github.client.GithubApiClient;
import com.devguardian.github.dto.GithubRepositoryResponse;
import com.devguardian.github.entity.GithubConnection;
import com.devguardian.github.service.interfaces.GithubConnectionService;
import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.ImportRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.enums.*;
import com.devguardian.repository.mapper.RepositoryMapper;
import com.devguardian.repository.repository.RepositoryRepository;
import com.devguardian.repository.service.interfaces.CloneService;
import com.devguardian.repository.service.interfaces.RepositoryService;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.common.exception.custom.ResourceNotFoundException;
import com.devguardian.common.exception.custom.BusinessException;
import com.devguardian.repository.config.WorkspaceProperties;
import com.devguardian.repository.dto.RemoteBranchesResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Ref;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Collection;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RepositoryServiceImpl implements RepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final RepositoryMapper repositoryMapper;
    private final CurrentUserUtil currentUserUtil;
    private final GithubConnectionService githubConnectionService;
    private final GithubApiClient githubApiClient;
    private final CloneService cloneService;
    private final WorkspaceProperties workspaceProperties;

    // CREATE REPOSITORY
    @Override
    public RepositoryResponse createRepository(CreateRepositoryRequest request) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryMapper.toEntity(request);

        repository.setUserId(userId);
        repository.setStatus(RepositoryStatus.ACTIVE);

        Repository saved = repositoryRepository.save(repository);

        return repositoryMapper.toResponse(saved);
    }

    // GET ALL USER REPOSITORIES
    @Override
    @Transactional(readOnly = true)
    public List<RepositoryResponse> getUserRepositories() {

        Long userId = currentUserUtil.getCurrentUser().getId();

        List<Repository> repositories = repositoryRepository.findByUserId(userId);

        return repositoryMapper.toResponse(repositories);
    }

    // GET REPOSITORY BY ID
    @Override
    @Transactional(readOnly = true)
    public RepositoryResponse getRepositoryById(Long id) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        return repositoryMapper.toResponse(repository);
    }

    // UPDATE REPOSITORY
    @Override
    public RepositoryResponse updateRepository(Long id, UpdateRepositoryRequest request) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        repository.setName(request.getName());
        repository.setDescription(request.getDescription());
        repository.setBranch(request.getBranch());
        repository.setLanguage(request.getLanguage());
        repository.setVisibility(request.getVisibility());
        repository.setType(request.getType());
        repository.setScanFrequency(request.getScanFrequency());

        Repository updated = repositoryRepository.save(repository);

        return repositoryMapper.toResponse(updated);
    }

    // DELETE REPOSITORY
    @Override
    public void deleteRepository(Long id) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        Repository repository = repositoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.REPOSITORY_NOT_FOUND));

        repositoryRepository.delete(repository);

        try {
            String basePath = workspaceProperties.getBasePath();
            java.io.File repoFolder = new java.io.File(basePath + java.io.File.separator + userId + java.io.File.separator + id);
            if (repoFolder.exists()) {
                deleteDirectoryRecursively(repoFolder);
            }
        } catch (Exception e) {
            log.warn("Failed to delete repository files for id {}: {}", id, e.getMessage());
        }
    }

    private void deleteDirectoryRecursively(java.io.File dir) {
        if (dir == null || !dir.exists()) {
            return;
        }
        try {
            java.nio.file.Files.walkFileTree(dir.toPath(), new java.nio.file.SimpleFileVisitor<java.nio.file.Path>() {
                @Override
                public java.nio.file.FileVisitResult visitFile(java.nio.file.Path file, java.nio.file.attribute.BasicFileAttributes attrs) throws java.io.IOException {
                    try {
                        file.toFile().setWritable(true);
                        java.nio.file.Files.deleteIfExists(file);
                    } catch (Exception ignored) {
                        file.toFile().delete();
                    }
                    return java.nio.file.FileVisitResult.CONTINUE;
                }

                @Override
                public java.nio.file.FileVisitResult postVisitDirectory(java.nio.file.Path dirPath, java.io.IOException exc) throws java.io.IOException {
                    try {
                        dirPath.toFile().setWritable(true);
                        java.nio.file.Files.deleteIfExists(dirPath);
                    } catch (Exception ignored) {
                        dirPath.toFile().delete();
                    }
                    return java.nio.file.FileVisitResult.CONTINUE;
                }
            });
        } catch (Exception e) {
            log.warn("Failed to cleanly delete directory {}: {}", dir.getAbsolutePath(), e.getMessage());
        }
    }

    @Override
    public RepositoryResponse importRepository(ImportRepositoryRequest request) {

        Long userId = currentUserUtil.getCurrentUser().getId();

        GithubConnection connection = githubConnectionService.getCurrentUserConnection();

        // 1. Get GitHub repos
        List<GithubRepositoryResponse> repos = githubApiClient.getUserRepositories(connection.getAccessToken());

        // 2. Find selected repo
        GithubRepositoryResponse selected = repos.stream()
                .filter(r -> r.getId().equals(request.getGithubRepoId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Repo not found"));

        // 3. Prevent duplicate import
        repositoryRepository.findByUserIdAndGithubRepoId(userId, selected.getId())
                .ifPresent(r -> {
                    throw new RuntimeException("Already imported");
                });

        // 4. Save in DevGuardian DB
        Repository repository = Repository.builder()
                .userId(userId)
                .name(selected.getName())
                .fullName(selected.getFullName())
                .githubRepoId(selected.getId())
                .cloneUrl(selected.getCloneUrl())
                .branch(selected.getDefaultBranch())
                .provider(RepositoryProvider.GITHUB)
                .status(RepositoryStatus.IMPORTED)
                .visibility(selected.isPrivate() ? Visibility.PRIVATE : Visibility.PUBLIC)
                .build();

        Repository saved = repositoryRepository.save(repository);

        return repositoryMapper.toResponse(saved);
    }

    @Override
    public void cloneRepository(Long id) {
        try {
            Long userId = currentUserUtil.getCurrentUser().getId();
            Repository repository = repositoryRepository.findByIdAndUserId(id, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Repository not found"));

            if (repository.getProvider() == RepositoryProvider.LOCAL) {
                java.io.File localDir = new java.io.File(repository.getCloneUrl());
                if (!localDir.exists() || !localDir.isDirectory()) {
                    throw new RuntimeException("Local repository directory does not exist or is not a directory: "
                            + repository.getCloneUrl());
                }
                return;
            }

            GithubConnection connection = null;
            if (repository.getProvider() == RepositoryProvider.GITHUB) {
                try {
                    connection = githubConnectionService.getCurrentUserConnection();
                } catch (Exception e) {
                    // Ignore, JGit will try public clone without credentials
                }
            }
            cloneService.cloneRepository(repository, connection);
        } catch (Exception ex) {
            try {
                java.io.StringWriter sw = new java.io.StringWriter();
                java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                ex.printStackTrace(pw);
                java.nio.file.Files.writeString(
                        java.nio.file.Paths.get("d:/DevGuardian/devguardian-backend/clone_error.log"),
                        "Clone ID: " + id + "\n" + sw.toString());
            } catch (Exception e) {
                // ignore
            }
            throw ex;
        }
    }

    @Override
    public RepositoryResponse uploadRepository(MultipartFile file, String name, String branch, String language) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        Long userId = currentUserUtil.getCurrentUser().getId();

        // 1. Create a transient or placeholder Repository to get a unique database ID
        Repository repository = Repository.builder()
                .userId(userId)
                .name(name)
                .fullName("uploads/" + name)
                .githubRepoId(System.currentTimeMillis()) // Mock unique ID
                .cloneUrl("pending")
                .branch(branch != null && !branch.isBlank() ? branch : "main")
                .language(language != null && !language.isBlank() ? language : "Auto")
                .provider(RepositoryProvider.LOCAL)
                .visibility(Visibility.PRIVATE)
                .status(RepositoryStatus.ACTIVE)
                .type(RepositoryType.GIT)
                .scanFrequency(ScanFrequency.DAILY)
                .build();

        Repository saved = repositoryRepository.save(repository);

        // 2. Define the extraction target path
        String targetPath = workspaceProperties.getBasePath()
                + java.io.File.separator
                + userId
                + java.io.File.separator
                + saved.getId()
                + java.io.File.separator
                + "source";

        java.io.File destDir = new java.io.File(targetPath);
        if (!destDir.exists()) {
            destDir.mkdirs();
        }

        // 3. Save the ZIP file temporarily and extract it
        java.io.File tempZipFile = null;
        try {
            tempZipFile = java.io.File.createTempFile("repo_upload_", ".zip");
            file.transferTo(tempZipFile);

            // Extract the ZIP contents to destDir
            extractZip(tempZipFile, destDir);

            // 4. Update the repository cloneUrl to point to the target path
            saved.setCloneUrl(destDir.getAbsolutePath().replace('\\', '/'));
            saved = repositoryRepository.save(saved);

        } catch (Exception e) {
            try {
                java.io.StringWriter sw = new java.io.StringWriter();
                java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                e.printStackTrace(pw);
                java.nio.file.Files.writeString(
                        java.nio.file.Paths.get("d:/DevGuardian/devguardian-backend/upload_error.log"),
                        "Upload error:\n" + sw.toString());
            } catch (Exception ex) {
                // ignore
            }
            // Clean up and throw
            if (destDir.exists()) {
                deleteDirectory(destDir);
            }
            repositoryRepository.delete(saved);
            throw new RuntimeException("Failed to process uploaded repository ZIP", e);
        } finally {
            if (tempZipFile != null && tempZipFile.exists()) {
                tempZipFile.delete();
            }
        }

        return repositoryMapper.toResponse(saved);
    }

    private void extractZip(java.io.File zipFile, java.io.File destDir) throws IOException {
        byte[] buffer = new byte[4096];
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(
                new java.io.FileInputStream(zipFile))) {
            java.util.zip.ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                // Ensure target file is within destination folder (guard against zip slip
                // vulnerability)
                java.io.File newFile = newFile(destDir, zipEntry);
                if (zipEntry.isDirectory()) {
                    if (!newFile.isDirectory() && !newFile.mkdirs()) {
                        throw new IOException("Failed to create directory " + newFile);
                    }
                } else {
                    // Fix for Windows: create parent directory if not exist
                    java.io.File parent = newFile.getParentFile();
                    if (!parent.isDirectory() && !parent.mkdirs()) {
                        throw new IOException("Failed to create directory " + parent);
                    }

                    // Write file content
                    try (java.io.FileOutputStream fos = new java.io.FileOutputStream(newFile)) {
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zipEntry = zis.getNextEntry();
            }
            zis.closeEntry();
        }
    }

    private java.io.File newFile(java.io.File destinationDir, java.util.zip.ZipEntry zipEntry) throws IOException {
        java.io.File destFile = new java.io.File(destinationDir, zipEntry.getName());

        String destDirPath = destinationDir.getCanonicalPath();
        String destFilePath = destFile.getCanonicalPath();

        if (!destFilePath.startsWith(destDirPath + java.io.File.separator) && !destFilePath.equals(destDirPath)) {
            throw new IOException("Entry is outside of the target dir: " + zipEntry.getName());
        }

        return destFile;
    }

    private void deleteDirectory(java.io.File directory) {
        java.io.File[] allContents = directory.listFiles();
        if (allContents != null) {
            for (java.io.File file : allContents) {
                deleteDirectory(file);
            }
        }
        directory.delete();
    }

    @Override
    @Transactional(readOnly = true)
    public RemoteBranchesResponse getRemoteBranches(String remoteUrl) {
        if (remoteUrl == null || remoteUrl.trim().isEmpty()) {
            throw new BusinessException("Remote repository URL cannot be empty");
        }

        String cleanedUrl = remoteUrl.trim();
        try {
            Collection<Ref> refs = Git.lsRemoteRepository()
                    .setRemote(cleanedUrl)
                    .setHeads(true)
                    .call();

            if (refs == null || refs.isEmpty()) {
                throw new ResourceNotFoundException(
                        "No branches found for repository. Please verify the URL is public and valid.");
            }

            List<String> branches = refs.stream()
                    .map(Ref::getName)
                    .filter(name -> name.startsWith("refs/heads/"))
                    .map(name -> name.substring("refs/heads/".length()))
                    .sorted()
                    .toList();

            if (branches.isEmpty()) {
                throw new ResourceNotFoundException("No branches found in remote repository.");
            }

            String defaultBranch = "main";
            if (branches.contains("main")) {
                defaultBranch = "main";
            } else if (branches.contains("master")) {
                defaultBranch = "master";
            } else {
                defaultBranch = branches.get(0);
            }

            return RemoteBranchesResponse.builder()
                    .defaultBranch(defaultBranch)
                    .branches(branches)
                    .build();

        } catch (ResourceNotFoundException | BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to query remote branches for URL: {}", cleanedUrl, ex);
            throw new BusinessException("Unable to access repository at " + cleanedUrl
                    + ". Please ensure the repository exists, is public, and the URL is correct.");
        }
    }
}
