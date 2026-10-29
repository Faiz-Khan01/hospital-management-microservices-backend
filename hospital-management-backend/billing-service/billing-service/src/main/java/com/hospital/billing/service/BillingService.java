package com.hospital.billing.service;

import com.hospital.billing.entity.Billing;
import com.hospital.billing.repository.BillingRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

@Service
public class BillingService {

    private final BillingRepository repository;

    public BillingService(BillingRepository repository) {
        this.repository = repository;
    }

    public Billing createBill(Billing bill) {
        // ⚡ Automatically calculate total amount before saving to database
        double consultation = bill.getConsultationFee() != null ? bill.getConsultationFee() : 0.0;
        double pharmacy = bill.getMedicineCharge() != null ? bill.getMedicineCharge() : 0.0;

        bill.setTotalAmount(consultation + pharmacy);
        bill.setBillingDate(LocalDate.now()); // Sets today's date automatically

        return repository.save(bill);
    }

    public List<Billing> getAllBills() {
        return repository.findAll();
    }

    public Page<Billing> searchBills(Long patientId, String paymentStatus, String paymentMode,
                                     Pageable pageable) {
        Specification<Billing> specification = (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (patientId != null) {
                predicate = builder.and(predicate, builder.equal(root.get("patientId"), patientId));
            }
            if (paymentStatus != null && !paymentStatus.isBlank()) {
                predicate = builder.and(predicate, builder.equal(
                        builder.lower(root.get("paymentStatus")), paymentStatus.trim().toLowerCase()));
            }
            if (paymentMode != null && !paymentMode.isBlank()) {
                predicate = builder.and(predicate, builder.equal(
                        builder.lower(root.get("paymentMode")), paymentMode.trim().toLowerCase()));
            }
            return predicate;
        };
        return repository.findAll(specification, pageable);
    }

    public Billing getBillById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Billing updatePaymentStatus(Long id, String status) {
        Billing bill = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        bill.setPaymentStatus(status);
        return repository.save(bill);
    }
}