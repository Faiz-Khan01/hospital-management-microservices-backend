package com.hospital.payment.controller;

import com.hospital.payment.dto.PaymentDto;
import com.hospital.payment.dto.RazorpayOrderRequest;
import com.hospital.payment.dto.RazorpayOrderResponse;
import com.hospital.payment.dto.RazorpayVerifyRequest;
import com.hospital.payment.entity.Payment;
import com.hospital.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final com.hospital.payment.service.RazorpayService razorpayService;

    @PostMapping("/razorpay/order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequest request) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(razorpayService.createOrder(request));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<Payment> verifyRazorpayPayment(
            @Valid @RequestBody RazorpayVerifyRequest request) throws Exception {
        return ResponseEntity.ok(razorpayService.verifyAndCapture(request));
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(paymentService.getPaymentsByPatientId(patientId));
    }

    @PostMapping
    public ResponseEntity<PaymentDto> createPayment(@RequestBody Payment payment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(payment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentDto> updatePayment(@PathVariable Long id, @RequestBody Payment details) {
        return ResponseEntity.ok(paymentService.updatePayment(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
