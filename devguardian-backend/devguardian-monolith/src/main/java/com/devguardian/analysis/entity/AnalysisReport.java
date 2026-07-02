package com.devguardian.analysis.entity;

import com.devguardian.analysis.enums.ReportFormat;
import com.devguardian.analysis.enums.ReportType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * One report belongs to one analysis
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false, unique = true)
    private Analysis analysis;

    /*
     * Report classification
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType reportType;

    /*
     * Report format
     * Example:
     * JSON, MARKDOWN, HTML, PDF
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportFormat format;

    /*
     * Generated report content
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /*
     * Whether AI generated/enhanced this report
     */
    private Boolean aiGenerated;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {

        if (this.aiGenerated == null) {
            this.aiGenerated = false;
        }

        if (this.format == null) {
            this.format = ReportFormat.JSON;
        }

        if (this.reportType == null) {
            this.reportType = ReportType.SUMMARY;
        }
    }
}