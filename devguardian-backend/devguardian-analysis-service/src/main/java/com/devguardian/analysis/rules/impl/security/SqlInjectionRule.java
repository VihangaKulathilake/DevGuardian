package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.support.AbstractLineScanRule;
import com.devguardian.analysis.rules.support.CommentTracker;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Detects SQL statements built by concatenating or formatting <em>dynamic
 * expressions</em> into a query string.
 *
 * <p>Key false-positive fixes over the naive {@code SELECT.*\+} approach:</p>
 * <ul>
 *   <li>Analyzes whole Java statements (joined until {@code ;}), so
 *       multi-line queries are understood as a unit.</li>
 *   <li>Literal-to-literal concatenation ({@code "SELECT ... " + "WHERE x = ?"})
 *       is the standard way to wrap long queries and is <b>never</b> flagged;
 *       only concatenation with non-literal expressions fires.</li>
 *   <li>{@code UPPER_SNAKE_CASE} constants (table/column name constants) and
 *       numeric literals are treated as static and ignored.</li>
 *   <li>Logging statements, comments and non-Java files are ignored, so a
 *       {@code +} in prose like "UPDATE + DELETE endpoints" no longer fires.</li>
 *   <li>{@code String.format}/{@code formatted} with string specifiers inside
 *       SQL is additionally detected - a common injection vector the old rule
 *       missed entirely.</li>
 * </ul>
 */
@Component
public class SqlInjectionRule extends AbstractLineScanRule {

    /** A string literal that begins a SQL statement. */
    private static final Pattern SQL_LITERAL_START = Pattern.compile(
            "\"\\s*(?:SELECT\\s|INSERT\\s+INTO\\s|UPDATE\\s|DELETE\\s+FROM\\s|MERGE\\s+INTO\\s|WITH\\s)",
            Pattern.CASE_INSENSITIVE);

    /** {@code "literal" + expression} - captures the expression head. */
    private static final Pattern LITERAL_PLUS_EXPRESSION = Pattern.compile(
            "\"\\s*\\+\\s*([A-Za-z_$][\\w$]*(?:\\.[\\w$]+)*(?:\\([^()]*\\))?)");

    /** {@code expression + "literal"} - captures the expression tail. */
    private static final Pattern EXPRESSION_PLUS_LITERAL = Pattern.compile(
            "(?<![\"\\w$])([A-Za-z_$][\\w$]*(?:\\.[\\w$]+)*(?:\\([^()]*\\))?)\\s*\\+\\s*\"");

    /** String.format("SELECT ... %s ...", args) / "...".formatted(args). */
    private static final Pattern FORMATTED_SQL = Pattern.compile(
            "(?:String\\.format\\s*\\(\\s*)?\"\\s*(?:SELECT|INSERT|UPDATE|DELETE|MERGE)\\b[^\"]*%s[^\"]*\"",
            Pattern.CASE_INSENSITIVE);

    /** Static expressions: ALL_CAPS constants, class constant refs, numbers. */
    private static final Pattern STATIC_EXPRESSION = Pattern.compile(
            "^(?:[A-Z][A-Z0-9_]*(?:\\.[A-Z][A-Z0-9_]*)*|[\\w$]+\\.[A-Z][A-Z0-9_]*|\\d+)$");

    /** Expressions that indicate the value was made safe or is structural. */
    private static final Pattern SANITIZED_EXPRESSION = Pattern.compile(
            "(?i)(?:escape|sanitiz|quoteIdentifier|Integer\\.parseInt|Long\\.parseLong|"
                    + "\\.ordinal\\(\\)|\\.name\\(\\)|Enum\\.)");

    private static final Pattern LOG_STATEMENT = Pattern.compile(
            "(?i)\\b(?:log(?:ger)?\\.(?:trace|debug|info|warn|error)|System\\.(?:out|err)\\.print)");

    @Override
    public String getRuleCode() {
        return "SQL_INJECTION_RULE";
    }

    @Override
    public String getName() {
        return "SQL Injection Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isJavaSource(normalizedPath);
    }

    @Override
    protected void scanFile(String filePath, String content, List<Issue> issues) {
        String[] lines = content.split("\n", -1);
        CommentTracker tracker = CommentTracker.forFile(filePath);

        StringBuilder statement = new StringBuilder();
        int statementStartLine = -1;

        for (int i = 0; i < lines.length; i++) {
            String code = tracker.stripComments(lines[i]);
            if (code.isBlank()) {
                continue;
            }
            if (statement.length() == 0) {
                statementStartLine = i + 1;
            }
            statement.append(code).append(' ');

            // A statement ends at ';' or at a block boundary. This keeps the
            // joined unit small and line numbers accurate.
            String trimmed = code.trim();
            boolean boundary = trimmed.endsWith(";") || trimmed.endsWith("{")
                    || trimmed.endsWith("}") || statement.length() > 4000;
            if (!boundary) {
                continue;
            }
            analyzeStatement(filePath, statement.toString(), statementStartLine, issues);
            statement.setLength(0);
        }
        if (statement.length() > 0) {
            analyzeStatement(filePath, statement.toString(), statementStartLine, issues);
        }
    }

    private void analyzeStatement(String filePath, String statement, int lineNumber,
                                  List<Issue> issues) {
        if (!SQL_LITERAL_START.matcher(statement).find()) {
            return;
        }
        // Logging a query is not an injection sink.
        if (LOG_STATEMENT.matcher(statement).find()) {
            return;
        }

        List<String> dynamicParts = new ArrayList<>();
        collectDynamicExpressions(LITERAL_PLUS_EXPRESSION.matcher(statement), dynamicParts);
        collectDynamicExpressions(EXPRESSION_PLUS_LITERAL.matcher(statement), dynamicParts);

        boolean formatted = FORMATTED_SQL.matcher(statement).find()
                && (statement.contains("String.format") || statement.contains(".formatted("));

        if (dynamicParts.isEmpty() && !formatted) {
            return; // Only literal-to-literal concatenation: safe line wrapping.
        }

        String evidence = formatted && dynamicParts.isEmpty()
                ? "a String.format/formatted call with a %s specifier"
                : "concatenation with dynamic expression(s): " + String.join(", ", dynamicParts);

        issues.add(Issue.builder()
                .ruleCode(getRuleCode())
                .title("Potential SQL Injection")
                .description("A SQL statement is built using " + evidence
                        + ". If any of these values originate from user input, an attacker "
                        + "can alter the query's structure and read or modify arbitrary data.")
                .severity(SeverityLevel.HIGH)
                .category(IssueCategory.SECURITY)
                .filePath(filePath)
                .lineNumber(lineNumber)
                .recommendation("Use a PreparedStatement with '?' bind parameters (or named "
                        + "parameters in JPA/JdbcTemplate) instead of concatenating values. "
                        + "If identifiers (table/column names) must be dynamic, validate them "
                        + "against a strict allow-list.")
                .build());
    }

    private void collectDynamicExpressions(Matcher matcher, List<String> dynamicParts) {
        while (matcher.find()) {
            String expression = matcher.group(1).trim();
            if (STATIC_EXPRESSION.matcher(expression).matches()) {
                continue; // constants and numeric literals are not injectable
            }
            if (SANITIZED_EXPRESSION.matcher(expression).find()) {
                continue;
            }
            if (!dynamicParts.contains(expression)) {
                dynamicParts.add(expression);
            }
        }
    }
}
