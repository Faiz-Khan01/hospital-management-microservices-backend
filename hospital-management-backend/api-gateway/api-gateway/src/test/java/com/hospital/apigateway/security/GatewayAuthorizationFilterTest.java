package com.hospital.apigateway.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GatewayAuthorizationFilterTest {

    private final GatewayAuthorizationFilter filter =
            new GatewayAuthorizationFilter("HospitalManagementSystemSecretKeyForJWT2026VeryLongAndSecure123456789");

    @Test
    void adminCanAccessAnyRoute() {
        assertTrue(filter.isAllowed("/api/v1/users", "DELETE", "ADMIN"));
    }

    @Test
    void patientCannotAccessAdminRoutes() {
        assertFalse(filter.isAllowed("/api/v1/users", "GET", "PATIENT"));
        assertFalse(filter.isAllowed("/api/v1/roles", "GET", "PATIENT"));
    }

    @Test
    void patientCanAccessPatientRoutes() {
        assertTrue(filter.isAllowed("/api/v1/patients/10", "GET", "PATIENT"));
        assertTrue(filter.isAllowed("/api/v1/billing", "POST", "PATIENT"));
    }

    @Test
    void unsupportedOrMissingRoleIsDenied() {
        assertFalse(filter.isAllowed("/api/v1/patients", "GET", null));
        assertFalse(filter.isAllowed("/api/v1/patients", "GET", "UNKNOWN"));
    }
}
