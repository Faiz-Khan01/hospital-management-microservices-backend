package com.hospital.payment.service;

import com.hospital.payment.client.NotificationClient;
import com.hospital.payment.dto.PaymentDto;
import com.hospital.payment.entity.Payment;
import com.hospital.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final NotificationClient notificationClient;

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PaymentDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return mapToDto(payment);
    }

    public List<PaymentDto> getPaymentsByPatientId(Long patientId) {
        return paymentRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PaymentDto createPayment(Payment payment) {
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }
        if (payment.getStatus() == null) {
            payment.setStatus("PENDING");
        }
        Payment saved = paymentRepository.save(payment);
        return mapToDto(saved);
    }

    public PaymentDto updatePayment(Long id, Payment details) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        payment.setAmount(details.getAmount());
        payment.setPaymentMethod(details.getPaymentMethod());
        payment.setTransactionId(details.getTransactionId());
        payment.setStatus(details.getStatus());
        Payment saved = paymentRepository.save(payment);

        // Inter-service event: Trigger Payment Confirmation Notification when status = PAID
        if ("PAID".equalsIgnoreCase(saved.getStatus())) {
            try {
                Map<String, Object> notifRequest = new HashMap<>();
                notifRequest.put("userId", saved.getPatientId());
                notifRequest.put("type", "PAYMENT_CONFIRMATION");
                notifRequest.put("patientName", "Patient #" + saved.getPatientId());
                notifRequest.put("appointmentDate", saved.getPaymentDate() != null ? saved.getPaymentDate().toString() : "Today");
                notifRequest.put("departmentName", "Billing & Finance");
                notificationClient.triggerNotification(notifRequest);
                log.info("Payment confirmation notification dispatched for payment id={}", saved.getId());
            } catch (Exception e) {
                log.warn("Notification dispatch failed for payment id={}: {}", saved.getId(), e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    private PaymentDto mapToDto(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .patientId(payment.getPatientId())
                .billingId(payment.getBillingId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
