package com.devguardian.analysis.dto.projection;

import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;

public interface IssueCountProjection {
    Long getAnalysisId();
    SeverityLevel getSeverity();
    IssueCategory getCategory();
    Long getCount();
}

