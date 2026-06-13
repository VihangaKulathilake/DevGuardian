package com.devguardian.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // Shared schema reference for ErrorResponse (scanned from GlobalExceptionHandler responses)
        Schema<?> errorSchemaRef = new Schema<>().$ref("#/components/schemas/ErrorResponse");
        Content errorContent = new Content().addMediaType("application/json", 
                new MediaType().schema(errorSchemaRef));

        // Reusable API Responses
        ApiResponse badRequestResponse = new ApiResponse()
                .description("Bad Request - The request parameters were invalid or validation failed")
                .content(errorContent);

        ApiResponse unauthorizedResponse = new ApiResponse()
                .description("Unauthorized - Authentication token is missing, invalid, or expired")
                .content(errorContent);

        ApiResponse forbiddenResponse = new ApiResponse()
                .description("Forbidden - The authenticated user does not have permission to access this resource")
                .content(errorContent);

        ApiResponse notFoundResponse = new ApiResponse()
                .description("Not Found - The requested resource could not be found")
                .content(errorContent);

        ApiResponse internalErrorResponse = new ApiResponse()
                .description("Internal Server Error - An unexpected error occurred on the server")
                .content(errorContent);

        return new OpenAPI()
                .info(new Info()
                        .title("DevGuardian API")
                        .description("AI-Assisted DevSecOps Platform - Enterprise API Documentation")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("DevGuardian Security Team")
                                .email("security-support@devguardian.com")
                                .url("https://devguardian.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .name("bearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT Authentication Token. Format: Bearer &lt;token&gt;"))
                        .addResponses("400BadRequest", badRequestResponse)
                        .addResponses("401Unauthorized", unauthorizedResponse)
                        .addResponses("403Forbidden", forbiddenResponse)
                        .addResponses("404NotFound", notFoundResponse)
                        .addResponses("500InternalServerError", internalErrorResponse));
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("Authentication APIs")
                .pathsToMatch("/api/auth/**", "/api/v1/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi repositoryApi() {
        return GroupedOpenApi.builder()
                .group("Repository APIs")
                .pathsToMatch("/api/repositories/**", "/api/v1/repositories/**")
                .build();
    }

    @Bean
    public GroupedOpenApi analysisApi() {
        return GroupedOpenApi.builder()
                .group("Analysis APIs")
                .pathsToMatch("/api/analyses/**", "/api/v1/analyses/**", "/api/analysis/**", "/api/v1/analysis/**")
                .build();
    }
}