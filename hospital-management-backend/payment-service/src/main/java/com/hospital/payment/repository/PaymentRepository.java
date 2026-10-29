package com.hospital.payment.repository;

import com.hospital.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPatientId(Long patientId);
    List<Payment> findByBillingId(Long billingId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByStatus(String status);
}
