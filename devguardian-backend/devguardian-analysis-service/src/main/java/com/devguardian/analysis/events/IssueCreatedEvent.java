package com.devguardian.analysis.events;

import com.devguardian.analysis.entity.Issue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class IssueCreatedEvent {
    private final Issue issue;
}
