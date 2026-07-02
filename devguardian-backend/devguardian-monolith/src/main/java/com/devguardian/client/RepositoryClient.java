package com.devguardian.client;

import com.devguardian.repository.dto.RepositoryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "repository-service", path = "/api/repositories")
public interface RepositoryClient {

    @GetMapping("/{id}")
    RepositoryResponse getRepository(@PathVariable("id") Long id);

    @PostMapping("/{id}/clone")
    void cloneRepository(@PathVariable("id") Long id);
}
