package com.bookmg.core.service;

import com.bookmg.core.exception.ResourceNotFoundException;
import com.bookmg.core.model.Resource;
import com.bookmg.core.repository.InMemoryRepository;

import java.util.List;

/**
 * Service managing resource catalog, search, and availability inquiries.
 */
public class ResourceService {
    private final InMemoryRepository<Resource> resourceRepository;

    public ResourceService(InMemoryRepository<Resource> resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Resource addResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
}
