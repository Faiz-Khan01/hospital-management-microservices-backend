package com.hms.admission.controller;

import com.hms.admission.entity.Ward;
import com.hms.admission.service.WardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import java.util.Set;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/wards")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    @GetMapping
    public ResponseEntity<List<Ward>> getAll() {
        return ResponseEntity.ok(wardService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Ward>> search(@RequestParam(required = false) String name,
            @RequestParam(required = false) String wardType, @RequestParam(required = false) Long departmentId,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        if (pageable.getSort().stream().anyMatch(o -> !Set.of("id", "name", "wardType", "departmentId", "floorNumber", "totalBeds", "createdAt").contains(o.getProperty()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort field");
        }
        return ResponseEntity.ok(wardService.search(name, wardType, departmentId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ward> getById(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Ward> create(@RequestBody Ward ward) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wardService.create(ward));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ward> update(@PathVariable Long id, @RequestBody Ward ward) {
        return ResponseEntity.ok(wardService.update(id, ward));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        wardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
