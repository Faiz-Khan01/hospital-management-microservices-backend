package com.hospital.billing.controller;

import com.hospital.billing.entity.Billing;
import com.hospital.billing.service.BillingService;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService service;

    public BillingController(BillingService service) {
        this.service = service;
    }

    @PostMapping
    public Billing create(@RequestBody Billing bill) {
        return service.createBill(bill);
    }

    @GetMapping
    public List<Billing> getAll() {
        return service.getAllBills();
    }

    @GetMapping("/search")
    public Page<Billing> search(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String paymentMode,
            @PageableDefault(size = 20, sort = "billingDate", direction = Sort.Direction.DESC) Pageable pageable) {
        if (pageable.getSort().stream().anyMatch(order ->
                !Set.of("id", "patientId", "patientName", "totalAmount", "paymentMode",
                        "paymentStatus", "billingDate").contains(order.getProperty()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort field");
        }
        return service.searchBills(patientId, paymentStatus, paymentMode, pageable);
    }

    @GetMapping("/{id}")
    public Billing getById(@PathVariable Long id) {
        return service.getBillById(id);
    }

    @PutMapping("/{id}/payment-status")
    public Billing updatePaymentStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updatePaymentStatus(id, status);
    }
}