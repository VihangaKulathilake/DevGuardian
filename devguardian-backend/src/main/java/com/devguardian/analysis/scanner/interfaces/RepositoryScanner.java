package com.devguardian.analysis.scanner.interfaces;

import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.repository.entity.Repository;

public interface RepositoryScanner {

    ScanContext scan(Repository repository);
}