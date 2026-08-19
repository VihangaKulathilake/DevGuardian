package com.devguardian.repository.service.interfaces;

import com.devguardian.github.entity.GithubConnection;
import com.devguardian.repository.entity.Repository;

public interface CloneService {

    String cloneRepository(
            Repository repository,
            GithubConnection githubConnection);
}