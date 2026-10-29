package com.hms.admission.controller;

import com.hms.admission.entity.Bed;
import com.hms.admission.service.BedService;
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
@RequestMapping("/api/v1/beds")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @GetMapping
    public ResponseEntity<List<Bed>> getAll(
            @RequestParam(required = false) Long wardId,
            @RequestParam(required = false) String status) {
        if (wardId != null) {
            return ResponseEntity.ok(bedService.getByWard(wardId));
        }

        if (status != null) {
            return ResponseEntity.ok(bedService.getByStatus(status));
        }
        return ResponseEntity.ok(bedService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Bed>> search(@RequestParam(required = false) Long wardId,
            @RequestParam(required = false) String status, @RequestParam(required = false) String bedType,
            @PageableDefault(size = 20, sort = "bedNumber") Pageable pageable) {
        if (pageable.getSort().stream().anyMatch(o -> !Set.of("id", "wardId", "bedNumber", "bedType", "status", "createdAt").contains(o.getProperty()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort field");
        }
        return ResponseEntity.ok(bedService.search(wardId, status, bedType, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bed> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Bed> create(@RequestBody Bed bed) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bedService.create(bed));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bed> update(@PathVariable Long id, @RequestBody Bed bed) {
        return ResponseEntity.ok(bedService.update(id, bed));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bedService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
