package com.hospital.auth.config;

import com.hospital.auth.entity.User;
import com.hospital.auth.enums.AccountStatus;
import com.hospital.auth.enums.Role;
import com.hospital.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfiguration {

    @Bean
    CommandLineRunner bootstrapAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.username:}") String username,
            @Value("${app.bootstrap-admin.email:}") String email,
            @Value("${app.bootstrap-admin.name:System Administrator}") String name,
            @Value("${app.bootstrap-admin.password:}") String password
    ) {
        return args -> {
            if (username.isBlank() || email.isBlank() || password.isBlank()) {
                return;
            }

            userRepository.findByUsername(username)
                    .or(() -> userRepository.findByEmail(email))
                    .ifPresentOrElse(existing -> {
                        if (existing.getRole() != Role.ADMIN
                                || existing.getStatus() != AccountStatus.ACTIVE
                                || !existing.isEnabled()
                                || !passwordEncoder.matches(password, existing.getPassword())) {
                            existing.setRole(Role.ADMIN);
                            existing.setStatus(AccountStatus.ACTIVE);
                            existing.setEnabled(true);
                            existing.setPassword(passwordEncoder.encode(password));
                            userRepository.save(existing);
                        }
                    }, () -> userRepository.save(User.builder()
                            .name(name)
                            .username(username)
                            .email(email)
                            .password(passwordEncoder.encode(password))
                            .role(Role.ADMIN)
                            .status(AccountStatus.ACTIVE)
                            .enabled(true)
                            .build()));
        };
    }
}
