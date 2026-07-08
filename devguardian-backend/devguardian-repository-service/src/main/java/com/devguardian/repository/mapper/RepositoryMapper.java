package com.devguardian.repository.mapper;

import com.devguardian.repository.dto.CreateRepositoryRequest;
import com.devguardian.repository.dto.RepositoryResponse;
import com.devguardian.repository.dto.UpdateRepositoryRequest;
import com.devguardian.repository.entity.Repository;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RepositoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)

    @Mapping(target = "files", ignore = true)
    @Mapping(target = "cloneUrl", source = "url")
    @Mapping(target = "fullName", expression = "java(extractFullName(request.getUrl()))")
    @Mapping(target = "githubRepoId", expression = "java(generateMockGithubRepoId(request.getUrl()))")
    @Mapping(target = "importedAt", expression = "java(java.time.LocalDateTime.now())")
    Repository toEntity(CreateRepositoryRequest request);

    @Mapping(target = "url", source = "cloneUrl")
    RepositoryResponse toResponse(Repository repository);

    List<RepositoryResponse> toResponse(List<Repository> repositories);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "githubRepoId", ignore = true)
    @Mapping(target = "cloneUrl", ignore = true)
    @Mapping(target = "importedAt", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)

    @Mapping(target = "files", ignore = true)
    void updateEntityFromRequest(UpdateRepositoryRequest request, @MappingTarget Repository repository);

    @Named("extractFullName")
    default String extractFullName(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "unknown/repository";
        }
        String normalized = url.trim();
        if (normalized.endsWith(".git")) {
            normalized = normalized.substring(0, normalized.length() - 4);
        }
        String[] parts = normalized.split("/");
        if (parts.length >= 2) {
            String repo = parts[parts.length - 1];
            String owner = parts[parts.length - 2];
            return owner + "/" + repo;
        }
        return "unknown/" + normalized.replaceAll("[^a-zA-Z0-9-]", "");
    }

    @Named("generateMockGithubRepoId")
    default Long generateMockGithubRepoId(String url) {
        if (url == null) {
            return 0L;
        }
        long hash = Math.abs((long) url.hashCode());
        return hash == 0 ? 1L : hash;
    }
}
