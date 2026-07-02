package com.devguardian.analysis.scanner.interfaces;

import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.repository.dto.RepositoryResponse;

public interface RepositoryScanner {
    ScanContext scan(RepositoryResponse repository);
}