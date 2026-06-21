package com.devguardian;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.devguardian.repository.config.WorkspaceProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(WorkspaceProperties.class)
public class DevguardianApplication {

	public static void main(String[] args) {
		SpringApplication.run(DevguardianApplication.class, args);
	}

}
