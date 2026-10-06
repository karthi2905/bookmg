package com.bookmg.auth.service;

import com.bookmg.auth.dto.UserDto;
import com.bookmg.auth.exception.ResourceNotFoundException;
import com.bookmg.auth.model.User;
import com.bookmg.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers(String department) {
        List<User> users;
        if (department != null && !department.isBlank()) {
            users = userRepository.findByDepartmentIgnoreCase(department.trim());
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(UserDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDto.fromEntity(user);
    }
}
