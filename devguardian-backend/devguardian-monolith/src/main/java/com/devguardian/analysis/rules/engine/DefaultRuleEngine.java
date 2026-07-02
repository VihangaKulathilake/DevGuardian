package com.devguardian.analysis.rules.engine;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DefaultRuleEngine implements RuleEngine {

    private final List<AnalysisRule> rules;

    @Override
    public List<Issue> runAllRules(ScanContext context) {

        return rules.parallelStream()
                .flatMap(rule -> rule.evaluate(context).stream())
                .toList();
    }
}