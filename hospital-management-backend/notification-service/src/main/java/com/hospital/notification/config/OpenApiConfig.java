package com.hospital.notification.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Hospital Notification Service API",
                version = "1.0.0",
                description = "Multi-channel notification dispatcher (Email, SMS, In-App alerts) for hospital events",
                contact = @Contact(name = "Hospital Tech Architecture Team", email = "tech@hospital.com")
        )
)
public class OpenApiConfig {
}
