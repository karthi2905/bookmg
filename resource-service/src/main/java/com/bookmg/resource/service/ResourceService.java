package com.bookmg.resource.service;

import com.bookmg.resource.dto.CreateResourceRequest;
import com.bookmg.resource.dto.ResourceResponse;
import com.bookmg.resource.dto.UpdateResourceRequest;
import com.bookmg.resource.exception.BadRequestException;
import com.bookmg.resource.exception.ResourceNotFoundException;
import com.bookmg.resource.model.Resource;
import com.bookmg.resource.model.ResourceType;
import com.bookmg.resource.repository.ResourceRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional
    public ResourceResponse createResource(CreateResourceRequest request) {
        String trimmedName = request.getName().trim();
        if (resourceRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new BadRequestException("A resource with name '" + trimmedName + "' already exists");
        }

        Resource resource = Resource.builder()
                .name(trimmedName)
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation().trim())
                .restricted(request.isRestricted())
                .active(true)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .features(request.getFeatures() != null ? new HashSet<>(request.getFeatures()) : new HashSet<>())
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Created new resource '{}' of type {} with ID {}", saved.getName(), saved.getType(), saved.getId());
        return ResourceResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return ResourceResponse.fromEntity(resource);
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> searchResources(
            ResourceType type,
            Integer minCapacity,
            Boolean restricted,
            Boolean activeOnly,
            String feature,
            String search
    ) {
        Specification<Resource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }

            if (restricted != null) {
                predicates.add(cb.equal(root.get("restricted"), restricted));
            }

            if (activeOnly != null && activeOnly) {
                predicates.add(cb.isTrue(root.get("active")));
            }

            if (StringUtils.hasText(feature)) {
                predicates.add(cb.isMember(feature.trim(), root.get("features")));
            }

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate locationLike = cb.like(cb.lower(root.get("location")), searchPattern);
                predicates.add(cb.or(nameLike, locationLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return resourceRepository.findAll(spec)
                .stream()
                .map(ResourceResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ResourceResponse updateResource(Long id, UpdateResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (StringUtils.hasText(request.getName())) {
            String newName = request.getName().trim();
            if (!newName.equalsIgnoreCase(resource.getName()) && resourceRepository.existsByNameIgnoreCase(newName)) {
                throw new BadRequestException("Another resource with name '" + newName + "' already exists");
            }
            resource.setName(newName);
        }

        if (request.getType() != null) {
            resource.setType(request.getType());
        }

        if (request.getCapacity() != null) {
            resource.setCapacity(request.getCapacity());
        }

        if (StringUtils.hasText(request.getLocation())) {
            resource.setLocation(request.getLocation().trim());
        }

        if (request.getRestricted() != null) {
            resource.setRestricted(request.getRestricted());
        }

        if (request.getActive() != null) {
            resource.setActive(request.getActive());
        }

        if (request.getDescription() != null) {
            resource.setDescription(request.getDescription().trim());
        }

        if (request.getFeatures() != null) {
            resource.setFeatures(new HashSet<>(request.getFeatures()));
        }

        Resource updated = resourceRepository.save(resource);
        log.info("Updated resource ID {}", updated.getId());
        return ResourceResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        // Soft delete: deactivate so historical bookings remain valid
        resource.setActive(false);
        resourceRepository.save(resource);
        log.info("Soft-deleted (deactivated) resource ID {}", id);
    }
}
