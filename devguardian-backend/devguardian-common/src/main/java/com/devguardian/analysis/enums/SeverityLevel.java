package com.devguardian.analysis.enums;

import lombok.Getter;

@Getter
public enum SeverityLevel {

    CRITICAL(4),
    HIGH(3),
    MEDIUM(2),
    LOW(1);

    private final int weight;

    SeverityLevel(int weight) {
        this.weight = weight;
    }
}