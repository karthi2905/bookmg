package com.bookmg.auth.config;

import com.bookmg.auth.model.Role;
import com.bookmg.auth.model.User;
import com.bookmg.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial users into auth database...");

            List<User> seedUsers = List.of(
                    User.builder()
                            .email("admin@bookmg.com")
                            .password(passwordEncoder.encode("admin123"))
                            .fullName("Admin User")
                            .role(Role.ROLE_ADMIN)
                            .department("IT")
                            .enabled(true)
                            .build(),
                    User.builder()
                            .email("manager@bookmg.com")
                            .password(passwordEncoder.encode("manager123"))
                            .fullName("Sarah Jenkins")
                            .role(Role.ROLE_MANAGER)
                            .department("ENGINEERING")
                            .enabled(true)
                            .build(),
                    User.builder()
                            .email("user@bookmg.com")
                            .password(passwordEncoder.encode("user123"))
                            .fullName("Alex Rivera")
                            .role(Role.ROLE_EMPLOYEE)
                            .department("ENGINEERING")
                            .enabled(true)
                            .build(),
                    User.builder()
                            .email("hr@bookmg.com")
                            .password(passwordEncoder.encode("hr123"))
                            .fullName("Elena Rostova")
                            .role(Role.ROLE_MANAGER)
                            .department("HR")
                            .enabled(true)
                            .build(),
                    User.builder()
                            .email("sales@bookmg.com")
                            .password(passwordEncoder.encode("sales123"))
                            .fullName("David Miller")
                            .role(Role.ROLE_EMPLOYEE)
                            .department("SALES")
                            .enabled(true)
                            .build()
            );

            userRepository.saveAll(seedUsers);
            log.info("Successfully seeded {} default users for testing (admin, manager, user, hr, sales)", seedUsers.size());
        } else {
            log.info("Users already exist in database, skipping data seeding.");
        }
    }
}
