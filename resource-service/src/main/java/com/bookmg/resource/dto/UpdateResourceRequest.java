package com.bookmg.resource.dto;

import com.bookmg.resource.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResourceRequest {

    @Size(max = 120, message = "Resource name must not exceed 120 characters")
    private String name;

    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    private Boolean restricted;

    private Boolean active;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private Set<String> features;
}
