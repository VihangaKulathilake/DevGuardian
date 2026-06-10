package com.devguardian.analysis.scanner.impl;

import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.repository.entity.Repository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@Primary
public class MockRepositoryScanner implements RepositoryScanner {

        @Override
        public ScanContext scan(Repository repository) {

                /*
                 * Simulated repository files
                 */
                Map<String, String> files = new HashMap<>();

                files.put(
                                "application.properties",
                                """
                                jwt.secret="mysecret123"
                                spring.datasource.password="admin123"
                                debug=true
                                """);

                files.put(
                                "SecurityConfig.java",
                                """
                                cors().allowedOrigins("*")
                                try {
                                        // code
                                } catch (Exception e) {}
                                String query = "SELECT * FROM users WHERE username = " + username;
                                """);

                files.put(
                                "Dockerfile",
                                """
                                FROM ubuntu
                                # TODO: Update base image
                                """);

                files.put(
                                ".env",
                                """
                                DATABASE_URL=postgres://localhost:5432/db
                                """);

                Map<String, Long> fileSizes = new HashMap<>();

                fileSizes.put("application.properties", 120L);
                fileSizes.put("SecurityConfig.java", 150L);
                fileSizes.put("Dockerfile", 45L);
                fileSizes.put(".env", 45L);

                return new ScanContext(repository, files, fileSizes);
        }
}