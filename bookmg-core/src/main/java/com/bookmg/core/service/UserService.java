package com.bookmg.core.service;

import com.bookmg.core.model.User;
import com.bookmg.core.repository.InMemoryRepository;

import java.util.List;
import java.util.Optional;

/**
 * Service managing enterprise users and directory lookups.
 */
public class UserService {
    private final InMemoryRepository<User> userRepository;

    public UserService(InMemoryRepository<User> userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
