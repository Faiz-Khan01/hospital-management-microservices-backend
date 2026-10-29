package com.hospital.user.controller;

import com.hospital.user.dto.UserCreateRequest;
import com.hospital.user.dto.UserDto;
import com.hospital.user.dto.UserUpdateRequest;
import com.hospital.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for user queries with pagination, dynamic multi-field filtering, caching, and profile lifecycle")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get Admin Dashboard Analytics", description = "Returns summary statistics, today's appointments schedule, and aggregations for 6 charts")
    @GetMapping("/dashboard/admin")
    public ResponseEntity<com.hospital.user.dto.AdminDashboardDto> getAdminDashboard() {
        log.info("REST request to fetch Admin Dashboard analytics");
        return ResponseEntity.ok(userService.getAdminDashboard());
    }

    @Operation(summary = "Get users with dynamic search, filtering, and pagination",
            description = "Supports multi-criteria filtering by search term (username, email, firstName, lastName), role, enabled status, with custom page size and sorting")
    @GetMapping
    public ResponseEntity<Page<UserDto>> getUsers(
            @Parameter(description = "Keyword to match against username, email, firstName, or lastName")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filter by role (e.g., ADMIN, DOCTOR, PATIENT)")
            @RequestParam(required = false) String role,
            @Parameter(description = "Filter by account active status")
            @RequestParam(required = false) Boolean enabled,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("REST request to fetch paginated users. search={}, role={}, enabled={}, pageable={}", search, role, enabled, pageable);
        return ResponseEntity.ok(userService.getUsers(search, role, enabled, pageable));
    }

    @Operation(summary = "Get user by ID", description = "Fetches user by primary key, cached via Redis")
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        log.info("REST request to fetch user by id: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Create user", description = "Creates a new user with input validation")
    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserCreateRequest request) {
        log.info("REST request to create user: {}", request.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @Operation(summary = "Update user", description = "Updates profile fields for an existing user and evicts cache")
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        log.info("REST request to update user id: {}", id);
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @Operation(summary = "Activate or deactivate user", description = "Updates account status flag and evicts cache")
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> status
    ) {
        Boolean enabled = status.getOrDefault("enabled", true);
        log.info("REST request to update user status id {}: enabled={}", id, enabled);
        return ResponseEntity.ok(userService.updateStatus(id, enabled));
    }

    @Operation(summary = "Delete user", description = "Deletes user by ID and evicts cache")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("REST request to delete user id: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
