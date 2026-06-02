package com.devguardian.analysis.scanner.impl;

import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.scanner.interfaces.RepositoryScanner;
import com.devguardian.repository.entity.Repository;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class GitRepositoryScanner implements RepositoryScanner {

    @Override
    public ScanContext scan(Repository repository) {

        /*
         * Future Flow
         *
         * 1. Clone repository
         * 2. Read repository files
         * 3. Build ScanContext
         * 4. Return context
         */

        Map<String, String> files = new HashMap<>();

        throw new UnsupportedOperationException(
                "Git repository scanning not implemented yet"
        );
    }
}