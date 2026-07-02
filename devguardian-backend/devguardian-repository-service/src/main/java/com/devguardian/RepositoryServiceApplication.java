package com.devguardian;

import com.devguardian.repository.config.WorkspaceProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@EnableConfigurationProperties(WorkspaceProperties.class)
public class RepositoryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(RepositoryServiceApplication.class, args);
    }
}
