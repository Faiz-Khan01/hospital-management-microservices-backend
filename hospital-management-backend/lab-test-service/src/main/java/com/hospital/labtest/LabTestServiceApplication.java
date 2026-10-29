package com.hospital.labtest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class LabTestServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabTestServiceApplication.class, args);
    }
}
