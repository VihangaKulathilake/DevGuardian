package com.devguardian.analysis.scoring.impl;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.scoring.interfaces.ScoreCalculator;
import com.devguardian.analysis.scoring.model.ScoreResult;
import org.springframework.stereotype.Component;

import java.util.List;

import static com.devguardian.analysis.enums.IssueCategory.*;

@Component
public class DefaultScoreCalculator implements ScoreCalculator {

    @Override
    public ScoreResult calculateScores(List<Issue> issues) {

        int securityScore = 100;
        int qualityScore = 100;
        int architectureScore = 100;

        for (Issue issue : issues) {

            int penalty = issue.getCategory().getDefaultWeight();

            switch (issue.getCategory()) {

                case SECURITY, SECRET_MANAGEMENT ->
                        securityScore -= penalty;

                case CONFIGURATION ->
                        architectureScore -= penalty;

                case DEPENDENCY ->
                        qualityScore -= penalty;

                case CODE_QUALITY ->
                        qualityScore -= penalty;
            }
        }

        return ScoreResult.builder()
                .securityScore(Math.max(0, securityScore))
                .qualityScore(Math.max(0, qualityScore))
                .architectureScore(Math.max(0, architectureScore))
                .build();
    }
}