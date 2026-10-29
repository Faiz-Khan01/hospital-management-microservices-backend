package com.hospital.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_usr_username", columnList = "username"),
        @Index(name = "idx_usr_email", columnList = "email"),
        @Index(name = "idx_usr_role_enabled", columnList = "role, enabled"),
        @Index(name = "idx_usr_names", columnList = "firstName, lastName")
    }
)
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;
    private String phone;
    private String role;

    @Builder.Default
    private boolean enabled = true;
}
