package com.bookmg.auth.controller;

import com.bookmg.auth.dto.UserDto;
import com.bookmg.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User directory and profile query endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get list of all users, optionally filtered by department")
    public ResponseEntity<List<UserDto>> getAllUsers(
            @RequestParam(name = "department", required = false) String department
    ) {
        List<UserDto> users = userService.getAllUsers(department);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by user ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable(name = "id") Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
}
