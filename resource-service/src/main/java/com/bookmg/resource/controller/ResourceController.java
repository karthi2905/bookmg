package com.bookmg.resource.controller;

import com.bookmg.resource.dto.CreateResourceRequest;
import com.bookmg.resource.dto.ResourceResponse;
import com.bookmg.resource.dto.UpdateResourceRequest;
import com.bookmg.resource.model.ResourceType;
import com.bookmg.resource.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Endpoints for resource catalog management, filtering, and inspection")
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    @Operation(summary = "Create a new bookable resource (Admin/Manager only)")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        ResourceResponse response = resourceService.createResource(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Search and filter catalog resources by type, capacity, features, or keyword")
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(name = "type", required = false) ResourceType type,
            @RequestParam(name = "minCapacity", required = false) Integer minCapacity,
            @RequestParam(name = "restricted", required = false) Boolean restricted,
            @RequestParam(name = "activeOnly", defaultValue = "false") Boolean activeOnly,
            @RequestParam(name = "feature", required = false) String feature,
            @RequestParam(name = "search", required = false) String search
    ) {
        List<ResourceResponse> results = resourceService.searchResources(
                type, minCapacity, restricted, activeOnly, feature, search
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource metadata and features by ID")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable(name = "id") Long id) {
        ResourceResponse response = resourceService.getResourceById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing resource (Admin/Manager only)")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody UpdateResourceRequest request
    ) {
        ResourceResponse response = resourceService.updateResource(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate (soft-delete) a resource (Admin/Manager only)")
    public ResponseEntity<Void> deleteResource(@PathVariable(name = "id") Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
