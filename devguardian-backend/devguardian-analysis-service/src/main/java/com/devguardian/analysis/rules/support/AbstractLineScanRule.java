package com.devguardian.analysis.rules.support;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Base class for line-oriented rules. Centralizes the noise-reduction
 * pipeline so every rule benefits from it consistently:
 *
 * <ol>
 *   <li>Skips vendored, generated, minified and lock files.</li>
 *   <li>Skips documentation unless the rule opts in.</li>
 *   <li>Skips test sources/fixtures unless the rule opts in.</li>
 *   <li>Restricts scanning to the file types the rule declares relevant.</li>
 *   <li>Strips comments (string-literal aware, multi-line block aware)
 *       before handing each line to the rule.</li>
 * </ol>
 */
public abstract class AbstractLineScanRule implements AnalysisRule {

    @Override
    public final List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();
        if (context == null || context.getFiles() == null) {
            return issues;
        }
        for (Map.Entry<String, String> entry : context.getFiles().entrySet()) {
            String rawPath = entry.getKey();
            String content = entry.getValue();
            if (rawPath == null || content == null || content.isEmpty()) {
                continue;
            }
            String path = ScanFilters.normalizePath(rawPath);
            if (ScanFilters.isExcludedPath(path)) {
                continue;
            }
            if (!scanDocumentation() && ScanFilters.isDocumentationFile(path)) {
                continue;
            }
            if (!scanTestFiles() && ScanFilters.isTestPath(path)) {
                continue;
            }
            if (!appliesTo(path)) {
                continue;
            }
            scanFile(path, content, issues);
        }
        return issues;
    }

    /**
     * Default per-file scan: iterate lines, strip comments, delegate to
     * {@link #checkLine}. Rules needing statement-level or whole-file analysis
     * may override this.
     */
    protected void scanFile(String filePath, String content, List<Issue> issues) {
        String[] lines = content.split("\n", -1);
        CommentTracker tracker = CommentTracker.forFile(filePath);
        for (int i = 0; i < lines.length; i++) {
            String code = tracker.stripComments(lines[i]);
            if (code.isBlank()) {
                continue;
            }
            checkLine(filePath, code, i + 1, issues);
        }
    }

    /** Which files this rule is relevant for (already noise-filtered). */
    protected abstract boolean appliesTo(String normalizedPath);

    /** Called once per non-comment line. */
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        // Optional hook for rules using the default scanFile implementation.
    }

    /** Most security rules should ignore test fixtures; override to opt in. */
    protected boolean scanTestFiles() {
        return false;
    }

    /** Documentation (md, html, txt, ...) is skipped by default. */
    protected boolean scanDocumentation() {
        return false;
    }
}
