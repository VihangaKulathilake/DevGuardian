package com.devguardian.analysis.rules.context;

import com.devguardian.repository.entity.Repository;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class ScanContext {

    /*
     * Repository being scanned
     */
    private Repository repository;

    /*
     * Simulated or fetched file content
     * key = file path
     * value = file content
     */
    private Map<String, String> files;
    private Map<String, Long> fileSizes;

}