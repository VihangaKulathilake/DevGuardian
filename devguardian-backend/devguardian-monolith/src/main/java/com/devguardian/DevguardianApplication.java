package com.devguardian;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.devguardian.repository.config.WorkspaceProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableConfigurationProperties(WorkspaceProperties.class)
@EnableAsync
@EnableFeignClients
public class DevguardianApplication {

	public static void main(String[] args) {
		SpringApplication.run(DevguardianApplication.class, args);
	}

}
