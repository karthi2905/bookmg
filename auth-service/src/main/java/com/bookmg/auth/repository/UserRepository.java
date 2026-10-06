package com.bookmg.auth.repository;

import com.bookmg.auth.model.Role;
import com.bookmg.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByDepartmentIgnoreCase(String department);

    List<User> findByRole(Role role);
}
