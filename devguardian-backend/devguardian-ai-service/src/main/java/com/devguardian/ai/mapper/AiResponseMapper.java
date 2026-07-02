package com.devguardian.ai.mapper;

import com.devguardian.ai.model.AiIssueResponse;
import org.springframework.stereotype.Component;

@Component
public class AiResponseMapper {

    public AiIssueResponse map(String raw) {

        AiIssueResponse res = new AiIssueResponse();

        res.setExplanation(extract(raw, "Explanation"));
        res.setImpact(extract(raw, "Impact"));
        res.setRecommendation(extract(raw, "Recommendation"));

        return res;
    }

    private String extract(String text, String key) {
        int start = text.indexOf(key + ":");
        if (start == -1) return "";

        int end = text.length();

        String[] keys = {"Explanation:", "Impact:", "Recommendation:"};

        for (String k : keys) {
            int idx = text.indexOf(k, start + key.length() + 1);
            if (idx != -1 && idx != start) {
                end = Math.min(end, idx);
            }
        }

        return text.substring(start + key.length() + 1, end).trim();
    }
}