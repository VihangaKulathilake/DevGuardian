package com.devguardian.analysis.rules.support;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Shared heuristics used by all analysis rules to keep false positives low.
 *
 * <p>Three layers of filtering are provided:</p>
 * <ol>
 *   <li><b>Path filtering</b> - vendored, generated, minified, lock and
 *       documentation files are never worth scanning for security findings.</li>
 *   <li><b>Test detection</b> - fixtures and unit tests are the single biggest
 *       source of secret-scanning noise; rules may opt out of scanning them.</li>
 *   <li><b>Value analysis</b> - placeholder detection, variable/env references
 *       and Shannon entropy allow rules to tell a real credential from
 *       {@code "changeme"} or {@code "${DB_PASSWORD}"}.</li>
 * </ol>
 */
public final class ScanFilters {

    private ScanFilters() {
    }

    /* ------------------------------------------------------------------ */
    /* Path classification                                                 */
    /* ------------------------------------------------------------------ */

    private static final Pattern EXCLUDED_DIR_PATTERN = Pattern.compile(
            "(?:^|/)(?:node_modules|vendor|third[_-]?party|bower_components|"
                    + "\\.git|\\.svn|\\.hg|\\.idea|\\.vscode|"
                    + "target|build|out|dist|bin|obj|generated|gen|"
                    + "__pycache__|\\.gradle|\\.mvn/wrapper)(?:/|$)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern LOCK_OR_GENERATED_FILE_PATTERN = Pattern.compile(
            "(?:^|/)(?:package-lock\\.json|yarn\\.lock|pnpm-lock\\.yaml|"
                    + "composer\\.lock|cargo\\.lock|poetry\\.lock|pipfile\\.lock|"
                    + "gemfile\\.lock|go\\.sum|gradle\\.lockfile|.*\\.min\\.(?:js|css)|"
                    + ".*\\.(?:map|pb|proto\\.gen)|.*[_.]generated\\.[a-z0-9]+)$",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern DOCUMENTATION_FILE_PATTERN = Pattern.compile(
            ".*\\.(?:md|markdown|rst|adoc|asciidoc|txt|html?|csv|svg|png|jpe?g|gif|pdf)$",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern TEST_PATH_PATTERN = Pattern.compile(
            "(?:^|/)(?:src/test/|src/it/|src/integration-test/|tests?/|__tests__/|"
                    + "__mocks__/|spec/|testdata/|test-resources/|fixtures?/|mocks?/)"
                    + "|(?:Test|Tests|IT|Spec)\\.(?:java|kt|groovy|scala)$"
                    + "|\\.(?:test|spec)\\.(?:[jt]sx?|py|rb)$"
                    + "|(?:^|/)test_[^/]+\\.py$",
            Pattern.CASE_INSENSITIVE);

    /** Normalizes Windows separators and leading "./" so path patterns match reliably. */
    public static String normalizePath(String filePath) {
        String normalized = filePath.replace('\\', '/').trim();
        while (normalized.startsWith("./")) {
            normalized = normalized.substring(2);
        }
        return normalized;
    }

    /** Directories and artifacts that should never be scanned by any rule. */
    public static boolean isExcludedPath(String normalizedPath) {
        return EXCLUDED_DIR_PATTERN.matcher(normalizedPath).find()
                || LOCK_OR_GENERATED_FILE_PATTERN.matcher(normalizedPath).find();
    }

    /** Prose / rendered assets - not executable configuration or code. */
    public static boolean isDocumentationFile(String normalizedPath) {
        return DOCUMENTATION_FILE_PATTERN.matcher(normalizedPath).matches();
    }

    /** Test sources, fixtures and mocks. */
    public static boolean isTestPath(String normalizedPath) {
        return TEST_PATH_PATTERN.matcher(normalizedPath).find();
    }

    public static String fileName(String normalizedPath) {
        int idx = normalizedPath.lastIndexOf('/');
        return idx >= 0 ? normalizedPath.substring(idx + 1) : normalizedPath;
    }

    public static boolean hasExtension(String normalizedPath, String... extensions) {
        String lower = normalizedPath.toLowerCase(Locale.ROOT);
        for (String extension : extensions) {
            if (lower.endsWith(extension)) {
                return true;
            }
        }
        return false;
    }

    public static boolean isJavaSource(String normalizedPath) {
        return hasExtension(normalizedPath, ".java", ".kt", ".groovy", ".scala");
    }

    public static boolean isSourceCode(String normalizedPath) {
        return hasExtension(normalizedPath,
                ".java", ".kt", ".groovy", ".scala",
                ".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs",
                ".py", ".php", ".cs", ".go", ".rb", ".rs",
                ".c", ".cpp", ".h", ".swift");
    }

    public static boolean isConfigFile(String normalizedPath) {
        return hasExtension(normalizedPath,
                ".properties", ".yml", ".yaml", ".xml", ".toml", ".ini",
                ".conf", ".cfg", ".env", ".json");
    }

    /* ------------------------------------------------------------------ */
    /* Value analysis                                                      */
    /* ------------------------------------------------------------------ */

    private static final Set<String> PLACEHOLDER_TOKENS = Set.of(
            "changeme", "change_me", "change-me", "changeit", "replaceme",
            "placeholder", "example", "sample", "dummy", "fake", "fixme",
            "todo", "tbd", "redacted", "removed", "masked", "hidden",
            "notset", "not_set", "not-set", "undefined", "unknown",
            "yourpassword", "your_password", "your-password", "password_here",
            "yourkey", "your_key", "your-key", "your_api_key", "your-api-key",
            "apikeyhere", "api_key_here", "secret_here", "insert_here",
            "enter_your", "put_your", "goes_here", "xxxxx");

    private static final Pattern ANGLE_BRACKET_PLACEHOLDER = Pattern.compile("^<[^<>]{1,60}>$");
    private static final Pattern REPEATED_CHARACTER = Pattern.compile("^(.)\\1{3,}$");
    private static final Pattern MASKED_VALUE = Pattern.compile("^[*x#.\\-_]{4,}$", Pattern.CASE_INSENSITIVE);

    /**
     * Values that reference configuration rather than contain it:
     * {@code ${...}}, {@code {{...}}}, {@code #{...}}, {@code %(...)s},
     * {@code $(...)}, {@code @...@} (Maven filtering), env lookups.
     */
    public static boolean isVariableReference(String value) {
        String v = value.trim();
        return v.startsWith("${") || v.startsWith("{{") || v.startsWith("#{")
                || v.startsWith("$(") || v.startsWith("%(")
                || (v.startsWith("@") && v.endsWith("@") && v.length() > 2)
                || v.startsWith("$") && v.length() > 1 && Character.isLetter(v.charAt(1))
                || v.contains("System.getenv") || v.contains("System.getProperty")
                || v.contains("process.env") || v.contains("os.environ");
    }

    /** Obvious non-credentials: templates, docs samples, masked values, booleans. */
    public static boolean isPlaceholderValue(String value) {
        String v = value.trim();
        if (v.isEmpty()) {
            return true;
        }
        String lower = v.toLowerCase(Locale.ROOT);
        if (lower.equals("null") || lower.equals("none") || lower.equals("nil")
                || lower.equals("true") || lower.equals("false")
                || lower.equals("test") || lower.equals("string")
                || lower.equals("value") || lower.equals("empty")) {
            return true;
        }
        if (ANGLE_BRACKET_PLACEHOLDER.matcher(v).matches()
                || REPEATED_CHARACTER.matcher(v).matches()
                || MASKED_VALUE.matcher(v).matches()) {
            return true;
        }
        String compact = lower.replaceAll("[\\s_\\-.]", "");
        for (String token : PLACEHOLDER_TOKENS) {
            String compactToken = token.replaceAll("[\\s_\\-.]", "");
            if (compact.equals(compactToken) || compact.contains(compactToken)) {
                return true;
            }
        }
        return false;
    }

    /** True when the assigned value is just the key's own name echoed back. */
    public static boolean valueEchoesKey(String key, String value) {
        String k = key.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        String v = value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return !k.isEmpty() && (v.equals(k) || v.equals(k + "value") || v.equals("my" + k));
    }

    /** Shannon entropy in bits per character. */
    public static double shannonEntropy(String value) {
        if (value == null || value.isEmpty()) {
            return 0.0;
        }
        int[] counts = new int[128];
        int otherCount = 0;
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c < 128) {
                counts[c]++;
            } else {
                otherCount++;
            }
        }
        double entropy = 0.0;
        double length = value.length();
        for (int count : counts) {
            if (count > 0) {
                double p = count / length;
                entropy -= p * (Math.log(p) / Math.log(2));
            }
        }
        if (otherCount > 0) {
            double p = otherCount / length;
            entropy -= p * (Math.log(p) / Math.log(2));
        }
        return entropy;
    }

    /** Number of character classes present (lower, upper, digit, symbol). */
    public static int characterClassCount(String value) {
        boolean lower = false;
        boolean upper = false;
        boolean digit = false;
        boolean symbol = false;
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (Character.isLowerCase(c)) {
                lower = true;
            } else if (Character.isUpperCase(c)) {
                upper = true;
            } else if (Character.isDigit(c)) {
                digit = true;
            } else {
                symbol = true;
            }
        }
        return (lower ? 1 : 0) + (upper ? 1 : 0) + (digit ? 1 : 0) + (symbol ? 1 : 0);
    }

    /**
     * Heuristic for "this string looks like a generated credential":
     * long enough, mixed character classes and high entropy. Natural-language
     * strings score around 2.5-3.5 bits/char; random tokens score above 3.5.
     */
    public static boolean looksLikeGeneratedToken(String value) {
        String v = value.trim();
        if (v.length() < 16) {
            return false;
        }
        return characterClassCount(v) >= 3 || shannonEntropy(v) >= 3.6;
    }

    /** Masks a sensitive value for safe inclusion in an issue description. */
    public static String mask(String value) {
        if (value == null || value.length() <= 6) {
            return "******";
        }
        return value.substring(0, 3) + "..." + value.substring(value.length() - 3)
                + " (" + value.length() + " chars)";
    }
}
