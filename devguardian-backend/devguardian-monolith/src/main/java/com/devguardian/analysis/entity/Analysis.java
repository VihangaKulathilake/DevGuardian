package com.devguardian.analysis.entity;

import com.devguardian.analysis.enums.AnalysisStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "analyses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repository_id", nullable = false)
    private Long repositoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisStatus status;

    /*
     * Score metrics
     */
    private Integer securityScore;

    private Integer qualityScore;

    private Integer architectureScore;

    /*
     * Future AI summary layer
     */
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    /*
     * Scan lifecycle timestamps
     */
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    /*
     * Audit timestamps
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /*
     * One analysis can contain many issues
     */
    @Builder.Default
    @OneToMany(
            mappedBy = "analysis",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Issue> issues = new ArrayList<>();

    /*
     * Optional generated report
     */
    @OneToOne(
            mappedBy = "analysis",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private AnalysisReport report;

    @PrePersist
    public void prePersist() {

        if (this.status == null) {
            this.status = AnalysisStatus.PENDING;
        }

        if (this.securityScore == null) {
            this.securityScore = 100;
        }

        if (this.qualityScore == null) {
            this.qualityScore = 100;
        }

        if (this.architectureScore == null) {
            this.architectureScore = 100;
        }
    }
}