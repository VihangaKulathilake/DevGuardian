package com.devguardian;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest
@AutoConfigureMockMvc
class DevguardianApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void testSwaggerUiIsAccessible() throws Exception {
		String[] paths = {
				"/swagger-ui/index.html",
				"/swagger-ui.html",
				"/swagger-ui",
				"/swagger-ui/",
				"/v3/api-docs",
				"/v3/api-docs/swagger-config"
		};

		for (String path : paths) {
			mockMvc.perform(get(path))
					.andExpect(result -> {
						int status = result.getResponse().getStatus();
						if (status == 401 || status == 403) {
							throw new AssertionError("Expected " + path + " to be accessible, but got status " + status);
						}
					});
		}
	}

}

