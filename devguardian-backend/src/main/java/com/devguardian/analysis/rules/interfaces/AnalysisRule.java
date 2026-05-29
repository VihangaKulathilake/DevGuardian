package com.devguardian.analysis.rules.interfaces;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.rules.context.ScanContext;

import java.util.List;

public interface AnalysisRule {

    /*
     * Unique rule identifier
     */
    String getRuleCode();

    /*
     * Human readable name
     */
    String getName();

    /*
     * Execute rule against repository context
     */
    List<Issue> evaluate(ScanContext context);
}