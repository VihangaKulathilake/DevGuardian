package com.devguardian.analysis.rules.engine;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.rules.context.ScanContext;

import java.util.List;

public interface RuleEngine {

    List<Issue> runAllRules(ScanContext context);
}