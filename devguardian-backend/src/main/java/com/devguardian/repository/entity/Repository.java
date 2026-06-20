package com.devguardian.repository.entity;

import com.devguardian.auth.entity.User;
import com.devguardian.analysis.entity.Analysis;
import com.devguardian.repository.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "repositories", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "github_repo_id"})
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "github_repo_id", nullable = false)
    private Long githubRepoId;

    @Column(length = 1000)
    private String description;

    @Column(name = "clone_url", length = 500, nullable = false)
    private String cloneUrl;

    // Free-form (do NOT enum this)
    private String language;

    // Free-form (user-defined Git branch names)
    private String branch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RepositoryProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RepositoryStatus status;

    @Enumerated(EnumType.STRING)
    private RepositoryType type;

    @Enumerated(EnumType.STRING)
    private ScanFrequency scanFrequency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @CreationTimestamp
    @Column(name = "imported_at")
    private LocalDateTime importedAt;

    // Future: analysis history
    @Builder.Default
    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Analysis> analyses = new ArrayList<>();

    // Future: repository file snapshots or scanned files
    @Builder.Default
    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<File> files = new ArrayList<>();
}
