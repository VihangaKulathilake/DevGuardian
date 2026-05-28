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

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RepositoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "analyses", ignore = true)
    @Mapping(target = "files", ignore = true)
    Repository toEntity(CreateRepositoryRequest request);

    RepositoryResponse toResponse(Repository repository);

    List<RepositoryResponse> toResponse(List<Repository> repositories);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "url", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "analyses", ignore = true)
    @Mapping(target = "files", ignore = true)
    void updateEntityFromRequest(UpdateRepositoryRequest request, @MappingTarget Repository repository);
}
