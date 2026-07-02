package com.devguardian.config;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.lang.annotation.*;

/**
 * Standard enterprise-grade error response documentation for DevGuardian APIs.
 * Applies standard HTTP responses defined globally in OpenApiConfig.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@ApiResponses({
    @ApiResponse(responseCode = "400", ref = "#/components/responses/400BadRequest"),
    @ApiResponse(responseCode = "401", ref = "#/components/responses/401Unauthorized"),
    @ApiResponse(responseCode = "403", ref = "#/components/responses/403Forbidden"),
    @ApiResponse(responseCode = "404", ref = "#/components/responses/404NotFound"),
    @ApiResponse(responseCode = "500", ref = "#/components/responses/500InternalServerError")
})
public @interface StandardErrorResponses {
}
