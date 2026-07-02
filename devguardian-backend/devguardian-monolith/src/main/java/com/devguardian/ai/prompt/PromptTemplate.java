package com.devguardian.ai.prompt;

public class PromptTemplate {

    public static final String ISSUE_ANALYSIS_PROMPT = """
You are a senior software security engineer.

Analyze the following code issue and respond STRICTLY in this format:

Explanation:
...

Impact:
...

Recommendation:
...

Issue Type: %s
File: %s

Code:
%s

Description:
%s
""";
}