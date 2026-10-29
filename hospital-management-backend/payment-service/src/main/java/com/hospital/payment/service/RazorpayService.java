package com.hospital.payment.service;

import com.hospital.payment.client.BillingClient;
import com.hospital.payment.client.NotificationClient;
import com.hospital.payment.dto.RazorpayOrderRequest;
import com.hospital.payment.dto.RazorpayOrderResponse;
import com.hospital.payment.dto.RazorpayVerifyRequest;
import com.hospital.payment.entity.Payment;
import com.hospital.payment.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayService {

    private final BillingClient billingClient;
    private final PaymentRepository paymentRepository;
    private final NotificationClient notificationClient;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    public RazorpayOrderResponse createOrder(RazorpayOrderRequest request) throws Exception {
        Map<String, Object> bill = billingClient.getBillById(request.getBillingId());
        if (bill == null || bill.get("totalAmount") == null) {
            throw new IllegalArgumentException("Bill not found with id: " + request.getBillingId());
        }
        BigDecimal amount = new BigDecimal(String.valueOf(bill.get("totalAmount")));

        if (amount.signum() <= 0) {
            throw new IllegalArgumentException("Bill amount must be greater than zero");
        }
        if (keyId.isBlank() || keySecret.isBlank()) {
            throw new IllegalStateException("Razorpay credentials are not configured");
        }

        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject options = new JSONObject();
        options.put("amount", Long.valueOf(amount.multiply(BigDecimal.valueOf(100)).longValueExact()));
        options.put("currency", "INR");
        options.put("receipt", "bill_" + request.getBillingId());
        Order order = client.orders.create(options);

        return RazorpayOrderResponse.builder()
                .orderId(order.get("id"))
                .billingId(request.getBillingId())
                .amount(amount)
                .currency("INR")
                .keyId(keyId)
                .build();
    }

    @Transactional
    public Payment verifyAndCapture(RazorpayVerifyRequest request) throws Exception {
        if (keySecret.isBlank()) {
            throw new IllegalStateException("Razorpay credentials are not configured");
        }

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", request.getRazorpayOrderId());
        attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
        attributes.put("razorpay_signature", request.getRazorpaySignature());
        if (!Utils.verifyPaymentSignature(attributes, keySecret)) {
            throw new IllegalArgumentException("Invalid Razorpay payment signature");
        }
        if (paymentRepository.findByTransactionId(request.getRazorpayPaymentId()).isPresent()) {
            throw new IllegalArgumentException("This Razorpay payment has already been processed");
        }

        Map<String, Object> bill = billingClient.getBillById(request.getBillingId());
        if (bill == null || bill.get("totalAmount") == null || bill.get("patientId") == null) {
            throw new IllegalArgumentException("Bill not found with id: " + request.getBillingId());
        }
        if ("PAID".equalsIgnoreCase(String.valueOf(bill.get("paymentStatus")))) {
            throw new IllegalArgumentException("Bill has already been paid");
        }
        Long patientId = ((Number) bill.get("patientId")).longValue();
        BigDecimal amount = new BigDecimal(String.valueOf(bill.get("totalAmount")));

        Payment payment = Payment.builder()
                .patientId(patientId)
                .billingId(request.getBillingId())
                .amount(amount)
                .paymentMethod("RAZORPAY")
                .transactionId(request.getRazorpayPaymentId())
                .status("PAID")
                .build();
        Payment saved = paymentRepository.save(payment);
        billingClient.updatePaymentStatus(request.getBillingId(), "Paid");

        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", patientId);
        notification.put("type", "PAYMENT_CONFIRMATION");
        notification.put("patientName", bill.getOrDefault("patientName", "Patient"));
        notification.put("amount", amount);
        notification.put("transactionId", request.getRazorpayPaymentId());
        try {
            notificationClient.triggerNotification(notification);
        } catch (Exception exception) {
            // Payment capture is authoritative; notification delivery can be retried separately.
            log.warn("Payment confirmation notification failed for payment {}: {}",
                    saved.getId(), exception.getMessage());
        }
        return saved;
    }
}
