package com.devguardian.analysis.scoring.interfaces;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.scoring.model.ScoreResult;

import java.util.List;

public interface ScoreCalculator {

    ScoreResult calculateScores(List<Issue> issues);
}