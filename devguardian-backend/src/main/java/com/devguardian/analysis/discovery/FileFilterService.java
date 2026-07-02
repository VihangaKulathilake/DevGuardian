package com.devguardian.analysis.discovery;

import java.io.IOException;
import java.nio.file.Path;

public interface FileFilterService {
    boolean shouldScan(Path file);
}
