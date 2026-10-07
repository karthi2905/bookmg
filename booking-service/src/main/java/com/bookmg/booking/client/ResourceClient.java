package com.bookmg.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "resource-service", url = "${resource-service.url:http://localhost:8082}")
public interface ResourceClient {

    @GetMapping("/api/v1/resources/{id}")
    ResourceDto getResourceById(@PathVariable("id") Long id);

    @GetMapping("/api/v1/resources")
    List<ResourceDto> getAllResources();
}
