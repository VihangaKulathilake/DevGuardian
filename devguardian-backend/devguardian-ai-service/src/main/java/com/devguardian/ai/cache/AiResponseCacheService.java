package com.devguardian.ai.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AiResponseCacheService {

    private final StringRedisTemplate redisTemplate;

    public String get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public void put(String key, String value) {
        redisTemplate.opsForValue().set(key, value, 24, TimeUnit.HOURS);
    }

    public String buildKey(String issueType, String code) {
        return "devguardian:ai:" + issueType + ":" + code.hashCode();
    }
}