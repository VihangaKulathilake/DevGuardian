package com.devguardian.analysis.enums;

import lombok.Getter;

@Getter
public enum IssueCategory {

    SECURITY(25),
    CONFIGURATION(10),
    DEPENDENCY(20),
    CODE_QUALITY(5),
    SECRET_MANAGEMENT(30);

    private final int defaultWeight;

    IssueCategory(int defaultWeight) {
        this.defaultWeight = defaultWeight;
    }
}