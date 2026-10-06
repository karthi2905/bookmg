package com.bookmg.resource.repository;

import com.bookmg.resource.model.Resource;
import com.bookmg.resource.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    List<Resource> findByActiveTrue();

    List<Resource> findByTypeAndActiveTrue(ResourceType type);

    boolean existsByNameIgnoreCase(String name);
}
