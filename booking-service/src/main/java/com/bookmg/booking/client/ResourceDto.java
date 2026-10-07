package com.bookmg.booking.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDto {
    private Long id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private boolean restricted;
    private boolean active;
    private Set<String> features;
}
