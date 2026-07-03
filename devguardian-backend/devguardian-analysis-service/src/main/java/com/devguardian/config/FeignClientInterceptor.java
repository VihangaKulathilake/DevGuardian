package com.devguardian.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientInterceptor implements RequestInterceptor {

    private static final ThreadLocal<String> tokenHolder = new ThreadLocal<>();

    public static void setToken(String token) {
        tokenHolder.set(token);
    }

    public static void clearToken() {
        tokenHolder.remove();
    }

    @Override
    public void apply(RequestTemplate template) {
        // 1. Try thread-local token (for async background scanning thread)
        String token = tokenHolder.get();

        // 2. Fall back to standard request context (for frontend request threads)
        if (token == null) {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                token = request.getHeader("Authorization");
            }
        }

        if (token != null) {
            template.header("Authorization", token);
        }
    }
}
