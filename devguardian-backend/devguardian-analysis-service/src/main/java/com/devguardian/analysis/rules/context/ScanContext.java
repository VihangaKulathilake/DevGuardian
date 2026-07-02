package com.devguardian.analysis.rules.context;

import com.devguardian.repository.dto.RepositoryResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class ScanContext {

    /*
     * Repository being scanned
     */
    private RepositoryResponse repository;

    /*
     * Simulated or fetched file content
     * key = file path
     * value = file content
     */
    private Map<String, String> files;
    private Map<String, Long> fileSizes;

}