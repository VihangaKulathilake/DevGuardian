package com.devguardian.repository.dto;

import com.devguardian.repository.enums.RepositoryProvider;
import com.devguardian.repository.enums.RepositoryType;
import com.devguardian.repository.enums.ScanFrequency;
import com.devguardian.repository.enums.Visibility;
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
