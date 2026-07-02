package com.devguardian.common.annotation;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Reusable annotation grouping common security, validation, and resource-not-found responses (400, 401, 403, 404, 500).
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@ApiResponses({
    @ApiResponse(responseCode = "400", ref = "#/components/responses/BadRequest"),
    @ApiResponse(responseCode = "401", ref = "#/components/responses/Unauthorized"),
    @ApiResponse(responseCode = "403", ref = "#/components/responses/Forbidden"),
    @ApiResponse(responseCode = "404", ref = "#/components/responses/NotFound"),
    @ApiResponse(responseCode = "500", ref = "#/components/responses/InternalServerError")
})
public @interface StandardSecuredResourceResponses {
}
