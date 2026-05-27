package com.devguardian.dto.repository;

import com.devguardian.entity.enums.RepositoryType;
import com.devguardian.entity.enums.ScanFrequency;
import com.devguardian.entity.enums.Visibility;
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