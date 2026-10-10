package com.bookmg.core.repository;

import com.bookmg.core.model.BaseEntity;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generic in-memory repository demonstrating bounded generics (T extends BaseEntity)
 * and collections framework (Map, List, Optional).
 */
public class InMemoryRepository<T extends BaseEntity> {
    private final Map<String, T> storage = new ConcurrentHashMap<>();

    public T save(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
        storage.put(entity.getId(), entity);
        return entity;
    }

    public Optional<T> findById(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(storage.get(id.trim()));
    }

    public List<T> findAll() {
        return new ArrayList<>(storage.values());
    }

    public boolean existsById(String id) {
        if (id == null) return false;
        return storage.containsKey(id.trim());
    }

    public boolean deleteById(String id) {
        if (id == null) return false;
        return storage.remove(id.trim()) != null;
    }

    public int count() {
        return storage.size();
    }

    public void clear() {
        storage.clear();
    }
}
