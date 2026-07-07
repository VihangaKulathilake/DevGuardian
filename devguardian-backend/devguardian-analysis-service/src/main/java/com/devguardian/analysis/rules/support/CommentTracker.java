package com.devguardian.analysis.rules.support;

import java.util.Locale;

/**
 * Strips comments from source lines while preserving string literals, so that
 * rules never fire on commented-out code and never miss a URL or secret just
 * because it sits inside a quoted string containing {@code //} or {@code #}.
 *
 * <p>The tracker is stateful: create one instance per file and feed it lines
 * in order so that multi-line block comments ({@code /* ... *&#47;} and
 * {@code <!-- ... -->}) are handled correctly.</p>
 */
public final class CommentTracker {

    private enum Style { C_LIKE, HASH, YAML, XML, PLAIN }

    private final Style style;
    private boolean inBlockComment;

    private CommentTracker(Style style) {
        this.style = style;
    }

    public static CommentTracker forFile(String normalizedPath) {
        String lower = normalizedPath.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".java") || lower.endsWith(".kt") || lower.endsWith(".kts")
                || lower.endsWith(".groovy") || lower.endsWith(".scala")
                || lower.endsWith(".js") || lower.endsWith(".jsx")
                || lower.endsWith(".ts") || lower.endsWith(".tsx")
                || lower.endsWith(".c") || lower.endsWith(".cc") || lower.endsWith(".cpp")
                || lower.endsWith(".cs") || lower.endsWith(".go") || lower.endsWith(".swift")
                || lower.endsWith(".gradle") || lower.endsWith(".json5")) {
            return new CommentTracker(Style.C_LIKE);
        }
        if (lower.endsWith(".yml") || lower.endsWith(".yaml")) {
            return new CommentTracker(Style.YAML);
        }
        if (lower.endsWith(".properties") || lower.endsWith(".env") || lower.endsWith(".ini")
                || lower.endsWith(".conf") || lower.endsWith(".cfg") || lower.endsWith(".toml")
                || lower.endsWith(".sh") || lower.endsWith(".py") || lower.endsWith(".rb")
                || lower.endsWith("dockerfile") || lower.endsWith(".dockerfile")) {
            return new CommentTracker(Style.HASH);
        }
        if (lower.endsWith(".xml") || lower.endsWith(".html") || lower.endsWith(".htm")
                || lower.endsWith(".xhtml") || lower.endsWith(".xsd") || lower.endsWith(".wsdl")
                || lower.endsWith(".pom")) {
            return new CommentTracker(Style.XML);
        }
        return new CommentTracker(Style.PLAIN);
    }

    /**
     * Returns the executable/effective portion of the line with comments
     * removed. Returns an empty string when the whole line is a comment.
     */
    public String stripComments(String line) {
        switch (style) {
            case C_LIKE:
                return stripCLike(line);
            case YAML:
                return stripYaml(line);
            case HASH:
                return stripHash(line);
            case XML:
                return stripXml(line);
            default:
                return line;
        }
    }

    private String stripCLike(String line) {
        StringBuilder code = new StringBuilder(line.length());
        boolean inString = false;
        boolean inChar = false;
        char stringDelimiter = '"';
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            char next = i + 1 < line.length() ? line.charAt(i + 1) : '\0';

            if (inBlockComment) {
                if (c == '*' && next == '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }
            if (inString) {
                code.append(c);
                if (c == '\\' && i + 1 < line.length()) {
                    code.append(next);
                    i++;
                } else if (c == stringDelimiter) {
                    inString = false;
                }
                continue;
            }
            if (inChar) {
                code.append(c);
                if (c == '\\' && i + 1 < line.length()) {
                    code.append(next);
                    i++;
                } else if (c == '\'') {
                    inChar = false;
                }
                continue;
            }
            if (c == '/' && next == '/') {
                break; // rest of line is a comment
            }
            if (c == '/' && next == '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (c == '"' || c == '`') {
                inString = true;
                stringDelimiter = c;
            } else if (c == '\'') {
                inChar = true;
            }
            code.append(c);
        }
        return code.toString();
    }

    private String stripYaml(String line) {
        boolean inSingle = false;
        boolean inDouble = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\'' && !inDouble) {
                inSingle = !inSingle;
            } else if (c == '"' && !inSingle) {
                inDouble = !inDouble;
            } else if (c == '#' && !inSingle && !inDouble) {
                // YAML comments must be at line start or preceded by whitespace
                if (i == 0 || Character.isWhitespace(line.charAt(i - 1))) {
                    return line.substring(0, i);
                }
            }
        }
        return line;
    }

    private String stripHash(String line) {
        String trimmed = line.trim();
        if (trimmed.startsWith("#") || trimmed.startsWith("!")) {
            return "";
        }
        // Shell-style trailing comments: only strip when '#' is preceded by
        // whitespace and not inside quotes.
        boolean inSingle = false;
        boolean inDouble = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\'' && !inDouble) {
                inSingle = !inSingle;
            } else if (c == '"' && !inSingle) {
                inDouble = !inDouble;
            } else if (c == '#' && !inSingle && !inDouble
                    && i > 0 && Character.isWhitespace(line.charAt(i - 1))) {
                return line.substring(0, i);
            }
        }
        return line;
    }

    private String stripXml(String line) {
        StringBuilder code = new StringBuilder(line.length());
        int i = 0;
        while (i < line.length()) {
            if (inBlockComment) {
                int end = line.indexOf("-->", i);
                if (end < 0) {
                    return code.toString();
                }
                inBlockComment = false;
                i = end + 3;
                continue;
            }
            int start = line.indexOf("<!--", i);
            if (start < 0) {
                code.append(line, i, line.length());
                break;
            }
            code.append(line, i, start);
            inBlockComment = true;
            i = start + 4;
        }
        return code.toString();
    }
}
