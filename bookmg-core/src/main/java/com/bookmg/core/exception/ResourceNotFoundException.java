package com.bookmg.core.exception;

/**
 * Custom unchecked exception thrown when an operation references a resource ID that does not exist.
 */
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceId;

    public ResourceNotFoundException(String resourceId) {
        super(String.format("Resource with identifier '%s' was not found in the catalog.", resourceId));
        this.resourceId = resourceId;
    }

    public String getResourceId() {
        return resourceId;
    }
}
