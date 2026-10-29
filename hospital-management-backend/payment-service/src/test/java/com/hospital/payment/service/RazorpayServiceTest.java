package com.hospital.payment.service;

import com.hospital.payment.client.BillingClient;
import com.hospital.payment.client.NotificationClient;
import com.hospital.payment.dto.RazorpayVerifyRequest;
import com.hospital.payment.entity.Payment;
import com.hospital.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class RazorpayServiceTest {

    private PaymentRepository paymentRepository;
    private RazorpayService razorpayService;

    @BeforeEach
    void setUp() {
        paymentRepository = mock(PaymentRepository.class);
        razorpayService = new RazorpayService(
                mock(BillingClient.class),
                paymentRepository,
                mock(NotificationClient.class));
        ReflectionTestUtils.setField(razorpayService, "keySecret", "test-secret");
        ReflectionTestUtils.setField(razorpayService, "keyId", "test-key");
    }

    @Test
    void rejectsInvalidSignature() {
        RazorpayVerifyRequest request = request("invalid-signature");

        assertThrows(IllegalArgumentException.class,
                () -> razorpayService.verifyAndCapture(request));
        verifyNoInteractions(paymentRepository);
    }

    @Test
    void rejectsDuplicatePaymentAfterValidSignature() throws Exception {
        RazorpayVerifyRequest request = request(signatureFor(requestOrderId, requestPaymentId));
        when(paymentRepository.findByTransactionId(requestPaymentId))
                .thenReturn(Optional.of(Payment.builder().id(1L).build()));

        assertThrows(IllegalArgumentException.class,
                () -> razorpayService.verifyAndCapture(request));
        verify(paymentRepository).findByTransactionId(requestPaymentId);
    }

    private static final String requestOrderId = "order_test";
    private static final String requestPaymentId = "pay_test";

    private RazorpayVerifyRequest request(String signature) {
        RazorpayVerifyRequest request = new RazorpayVerifyRequest();
        request.setBillingId(1L);
        request.setRazorpayOrderId(requestOrderId);
        request.setRazorpayPaymentId(requestPaymentId);
        request.setRazorpaySignature(signature);
        return request;
    }

    private String signatureFor(String orderId, String paymentId) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("test-secret".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
        StringBuilder signature = new StringBuilder();
        for (byte value : digest) {
            signature.append(String.format("%02x", value));
        }
        return signature.toString();
    }
}
