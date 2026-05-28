package com.devguardian.repository.dto;

import com.devguardian.repository.enums.RepositoryType;
import com.devguardian.repository.enums.ScanFrequency;
import com.devguardian.repository.enums.Visibility;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRepositoryRequest {

    private String name;

    private String description;

    private String language;

    private String branch;

    private Visibility visibility;

    private RepositoryType type;

    private ScanFrequency scanFrequency;
}
