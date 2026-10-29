package com.hospital.labreport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import com.hospital.labreport.config.FeignAuthConfig;

@SpringBootApplication
@EnableFeignClients(defaultConfiguration = FeignAuthConfig.class)
public class LabReportServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabReportServiceApplication.class, args);
    }
}
