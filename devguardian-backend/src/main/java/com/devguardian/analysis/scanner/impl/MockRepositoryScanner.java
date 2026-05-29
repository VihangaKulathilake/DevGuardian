package com.devguardian.analysis.scanner.impl;

import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.repository.entity.Repository;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
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
                jwt.secret=mysecret123
                spring.datasource.password=admin123
                """
        );

        files.put(
                "SecurityConfig.java",
                """
                cors().allowedOrigins("*")
                """
        );

        files.put(
                "Dockerfile",
                """
                FROM ubuntu
                """
        );

        return new ScanContext(repository, files);
    }
}