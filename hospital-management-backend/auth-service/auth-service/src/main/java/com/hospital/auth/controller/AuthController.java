package com.hospital.auth.controller;

import com.hospital.auth.dto.*;
import com.hospital.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & User Access", description = "Endpoints for registration, login, JWT token management, password recovery, and user lifecycle administration")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(summary = "Register new user", description = "Registers a new user with role assignment and hashed password")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDto>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Received registration request for username: {}", request.getUsername());
        UserResponseDto created = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", created));
    }

    @Operation(summary = "User login", description = "Authenticates credentials and issues signed JWT token with role claims")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login attempt for username/email: {}", request.getUsername());
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @Operation(summary = "Forgot password request", description = "Generates and sends a 30-minute password reset token")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());
        String token = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset instructions sent. Token: " + token, token));
    }

    @Operation(summary = "Reset password", description = "Resets user password using a valid reset token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request with token");
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully"));
    }

    @Operation(summary = "Change password", description = "Changes password for current authenticated user with old password verification", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        log.info("Password change request for authenticated user: {}", principal.getName());
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @Operation(summary = "Get current user profile", description = "Returns profile details for the authenticated user", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser(Principal principal) {
        log.info("Fetching profile for user: {}", principal.getName());
        UserResponseDto profile = authService.getUserProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    @Operation(summary = "Activate or deactivate user account", description = "Restricted to ADMIN role. Toggles account active status", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request
    ) {
        log.info("Admin status update request for user ID {}: status={}", id, request.getStatus());
        UserResponseDto updated = authService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("User account status updated successfully", updated));
    }

    @Operation(summary = "Approve a staff role request", description = "Restricted to ADMIN role. Activates the requested staff role")
    @PutMapping("/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> approveRequestedRole(@PathVariable Long id) {
        UserResponseDto updated = authService.approveRequestedRole(id);
        return ResponseEntity.ok(ApiResponse.success("Staff role request approved successfully", updated));
    }

    @Operation(summary = "Assign a user role", description = "Restricted to ADMIN role. Assigns a non-admin role to an account")
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request
    ) {
        UserResponseDto updated = authService.updateUserRole(id, request);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updated));
    }

    @Operation(summary = "List all users", description = "Restricted to ADMIN role. Returns list of all registered users", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        log.info("Admin fetching all registered users");
        List<UserResponseDto> users = authService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }
}
