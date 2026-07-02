package com.devguardian.ai.cache;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiResponseCacheService {

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String get(String key) {
        return cache.get(key);
    }

    public void put(String key, String value) {
        cache.put(key, value);
    }

    public String buildKey(String issueType, String code) {
        return issueType + ":" + code.hashCode();
    }
}