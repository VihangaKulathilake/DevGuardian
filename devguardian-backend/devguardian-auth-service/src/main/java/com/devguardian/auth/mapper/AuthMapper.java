package com.devguardian.auth.mapper;

import com.devguardian.auth.dto.AuthResponse;
import com.devguardian.auth.dto.RegisterRequest;
import com.devguardian.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AuthMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "authTokens", ignore = true)
    User toEntity(RegisterRequest request);

    @Mapping(target = "token", ignore = true)
    @Mapping(target = "userId", source = "id")
    AuthResponse toResponse(User user);
}
