package com.devguardian.analysis.rules;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.impl.quality.*;
import com.devguardian.analysis.rules.impl.security.*;
import com.devguardian.analysis.rules.impl.architecture.*;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class RuleTests {

    @Test
    public void testWeakJwtSecretRule() {
        WeakJwtSecretRule rule = new WeakJwtSecretRule();
        
        Map<String, String> files = new HashMap<>();
        files.put("application.properties", "jwt.secret=secret\nother.prop=val\njwt.secret=${JWT_SECRET:password}");
        files.put("application-prod.properties", "jwt.secret=${JWT_SECRET}"); // safe case
        files.put("App.java", "String jwtSecret = \"123456\";");

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        // Weak secret 'secret' (line 1), fallback 'password' (line 3) in application.properties
        // and '123456' (line 1) in App.java should be flagged.
        // The safe case in application-prod.properties should not be flagged.
        assertEquals(3, issues.size());
        
        // Assertions for correctness
        assertTrue(issues.stream().anyMatch(i -> i.getFilePath().equals("application.properties") && i.getLineNumber() == 1));
        assertTrue(issues.stream().anyMatch(i -> i.getFilePath().equals("application.properties") && i.getLineNumber() == 3));
        assertTrue(issues.stream().anyMatch(i -> i.getFilePath().equals("App.java") && i.getLineNumber() == 1));
        
        issues.forEach(i -> {
            assertEquals("WEAK_JWT_SECRET_RULE", i.getRuleCode());
            assertEquals(SeverityLevel.HIGH, i.getSeverity());
            assertEquals(IssueCategory.SECRET_MANAGEMENT, i.getCategory());
        });
    }

    @Test
    public void testWildcardCorsRule() {
        WildcardCorsRule rule = new WildcardCorsRule();

        Map<String, String> files = new HashMap<>();
        files.put("WebConfig.java", "@CrossOrigin(\"*\")\n// @CrossOrigin(\"*\")\nallowedOrigins(\"*\")");
        files.put("App.properties", "cors.allowed=*"); // Should not scan non-Java

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(2, issues.size()); // line 1 and line 3 of WebConfig.java
        assertTrue(issues.stream().allMatch(i -> i.getFilePath().equals("WebConfig.java")));
    }

    @Test
    public void testHardcodedPasswordRule() {
        HardcodedPasswordRule rule = new HardcodedPasswordRule();

        Map<String, String> files = new HashMap<>();
        files.put("application.properties", "spring.datasource.password=admin123\nspring.datasource.pwd=${DB_PWD}\ndb.password=");
        files.put("Db.java", "String password = \"root\";\nString pwd = getPassword();");

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(2, issues.size()); // 'admin123' in properties, 'root' in Java
        assertTrue(issues.stream().anyMatch(i -> i.getFilePath().equals("application.properties") && i.getLineNumber() == 1));
        assertTrue(issues.stream().anyMatch(i -> i.getFilePath().equals("Db.java") && i.getLineNumber() == 1));
    }

    @Test
    public void testInsecureHttpUrlRule() {
        InsecureHttpUrlRule rule = new InsecureHttpUrlRule();

        Map<String, String> files = new HashMap<>();
        files.put("Config.java", "String url = \"http://api.devguardian.com/v1\";\n" +
                "String dev = \"http://localhost:8080\";\n" +
                "String w3 = \"http://www.w3.org/1999/xhtml\";");

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(1, issues.size()); // Only api.devguardian.com is flagged. localhost and w3.org are ignored.
        assertEquals("Config.java", issues.get(0).getFilePath());
        assertEquals(1, issues.get(0).getLineNumber());
    }

    @Test
    public void testApiKeyExposureRule() {
        ApiKeyExposureRule rule = new ApiKeyExposureRule();

        Map<String, String> files = new HashMap<>();
        files.put("Keys.java", "String stripe_key = \"sk_test_51NzABC123XYZ\";\n" +
                "String apiKey = \"${API_KEY}\";\n" +
                "String emptyKey = \"\";");

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(1, issues.size()); // Only stripe_key should be flagged.
        assertEquals("Keys.java", issues.get(0).getFilePath());
        assertEquals(1, issues.get(0).getLineNumber());
    }

    @Test
    public void testAwsCredentialRule() {
        AwsCredentialRule rule = new AwsCredentialRule();

        Map<String, String> files = new HashMap<>();
        files.put("AwsConfig.java", "String awsKey = \"AKIAIOSFODNN7EXAMPLE\";\n" +
                "String awsSecret = \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\";\n" +
                "String safeSecret = \"${AWS_SECRET}\";");

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(2, issues.size()); // Access Key (line 1) and Secret Key (line 2)
        assertTrue(issues.stream().anyMatch(i -> i.getTitle().contains("Access Key")));
        assertTrue(issues.stream().anyMatch(i -> i.getTitle().contains("Secret Access Key")));
    }

    @Test
    public void testLargeFileRule() {
        LargeFileRule rule = new LargeFileRule();

        Map<String, Long> fileSizes = new HashMap<>();
        fileSizes.put("large_source.java", 600 * 1024L); // 600 KB - warning
        fileSizes.put("huge_dump.sql", 2 * 1024 * 1024L); // 2 MB - critical
        fileSizes.put("package-lock.json", 1500 * 1024L); // Excluded

        ScanContext context = new ScanContext(null, new HashMap<>(), fileSizes);
        List<Issue> issues = rule.evaluate(context);

        assertEquals(2, issues.size());
        assertTrue(issues.stream().anyMatch(i -> i.getFilePath().equals("large_source.java")));
        assertTrue(issues.stream().anyMatch(i -> i.getFilePath().equals("huge_dump.sql")));
    }

    @Test
    public void testLongMethodRule() {
        LongMethodRule rule = new LongMethodRule();

        StringBuilder longMethod = new StringBuilder();
        longMethod.append("public class MyClass {\n");
        longMethod.append("  public void testMethod() {\n");
        for (int i = 0; i < 110; i++) {
            longMethod.append("    System.out.println(").append(i).append(");\n");
        }
        longMethod.append("  }\n");
        longMethod.append("}\n");

        Map<String, String> files = new HashMap<>();
        files.put("MyClass.java", longMethod.toString());

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(1, issues.size());
        assertEquals("MyClass.java", issues.get(0).getFilePath());
        assertEquals(2, issues.get(0).getLineNumber()); // Method starts at line 2
    }

    @Test
    public void testDeepNestingRule() {
        DeepNestingRule rule = new DeepNestingRule();

        String nestingCode = "public class Nesting {\n" +
                "  public void nested() {\n" +
                "    if (true) {\n" +
                "      for(int i=0; i<10; i++) {\n" +
                "        while(true) {\n" +
                "          switch(i) {\n" +
                "            case 1:\n" +
                "              if (true) {\n" + // Nesting depth 5 (if -> for -> while -> switch -> if)
                "                System.out.println();\n" +
                "              }\n" +
                "              break;\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}\n";

        Map<String, String> files = new HashMap<>();
        files.put("Nesting.java", nestingCode);

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(1, issues.size());
        assertEquals("Nesting.java", issues.get(0).getFilePath());
        assertEquals(8, issues.get(0).getLineNumber()); // Deep nesting begins inside switch case if
    }

    @Test
    public void testDuplicateConfigurationRule() {
        DuplicateConfigurationRule rule = new DuplicateConfigurationRule();

        Map<String, String> files = new HashMap<>();
        files.put("application.properties", "spring.datasource.url=jdbc:postgresql://localhost\n" +
                "server.port=8080\n" +
                "spring.datasource.url=jdbc:mysql://localhost\n");

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(1, issues.size());
        assertEquals("application.properties", issues.get(0).getFilePath());
        assertEquals(3, issues.get(0).getLineNumber());
    }

    @Test
    public void testControllerRepositoryAccessRule() {
        ControllerRepositoryAccessRule rule = new ControllerRepositoryAccessRule();

        String controllerCode = "@RestController\n" +
                "public class UserController {\n" +
                "  private UserRepository userRepository;\n" +
                "}\n";

        Map<String, String> files = new HashMap<>();
        files.put("UserController.java", controllerCode);

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(1, issues.size());
        assertEquals("UserController.java", issues.get(0).getFilePath());
        assertEquals(3, issues.get(0).getLineNumber());
    }

    @Test
    public void testLayerViolationRule() {
        LayerViolationRule rule = new LayerViolationRule();

        String violationCode = "import com.devguardian.repository.entity.User;\n" +
                "@RestController\n" +
                "public class UserController {\n" +
                "  @GetMapping(\"/user\")\n" +
                "  public User getUser() {\n" +
                "    return null;\n" +
                "  }\n" +
                "}\n";

        Map<String, String> files = new HashMap<>();
        files.put("UserController.java", violationCode);

        ScanContext context = new ScanContext(null, files, new HashMap<>());
        List<Issue> issues = rule.evaluate(context);

        assertEquals(1, issues.size());
        assertEquals("UserController.java", issues.get(0).getFilePath());
        assertEquals(5, issues.get(0).getLineNumber()); // Method signature getUser exposes entity User
    }
}
