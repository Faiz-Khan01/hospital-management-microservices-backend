package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients",
    indexes = {
        @Index(name = "idx_pat_name",    columnList = "name"),
        @Index(name = "idx_pat_contact", columnList = "contactNumber")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_user_id")
    private Long ownerUserId;

    @Column(nullable = false)
    private String name;

    private Integer age;

    private LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    @Column(name = "contact_number", nullable = false)
    private String contactNumber;

    private String email;

    private String address;

    private String disease;

    private String emergencyContactName;
    private String emergencyContactPhone;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}