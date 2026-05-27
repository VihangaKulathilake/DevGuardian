package com.devguardian.dto.repository;

import com.devguardian.entity.enums.RepositoryProvider;
import com.devguardian.entity.enums.RepositoryType;
import com.devguardian.entity.enums.ScanFrequency;
import com.devguardian.entity.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRepositoryRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String url;

    private String description;

    private String language;

    private String branch;

    private RepositoryProvider provider;

    private Visibility visibility;

    private RepositoryType type;

    private ScanFrequency scanFrequency;
}