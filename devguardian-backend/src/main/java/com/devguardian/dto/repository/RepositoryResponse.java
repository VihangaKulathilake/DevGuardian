package com.devguardian.dto.repository;

import com.devguardian.entity.enums.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryResponse {

    private Long id;

    private String name;

    private String url;

    private String description;

    private String language;

    private String branch;

    private RepositoryProvider provider;

    private Visibility visibility;

    private RepositoryStatus status;

    private RepositoryType type;

    private ScanFrequency scanFrequency;

    private LocalDateTime createdAt;
}