package com.bookmg.booking.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserPrincipal {
    private final Long userId;
    private final String email;
    private final String role;
    private final String department;
}
