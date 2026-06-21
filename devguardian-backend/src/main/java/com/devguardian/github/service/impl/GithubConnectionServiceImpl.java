package com.devguardian.github.service.impl;

import com.devguardian.auth.entity.User;
import com.devguardian.security.CurrentUserUtil;
import com.devguardian.github.entity.GithubConnection;
import com.devguardian.github.repository.GithubConnectionRepository;
import com.devguardian.github.service.interfaces.GithubConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GithubConnectionServiceImpl implements GithubConnectionService {

    private final GithubConnectionRepository repository;
    private final CurrentUserUtil currentUserUtil;

    @Override
    public GithubConnection getCurrentUserConnection() {

        User user = currentUserUtil.getCurrentUser();

        return repository.findByUser(user)
                .orElseThrow(() ->
                        new com.devguardian.common.exception.custom.ResourceNotFoundException("GitHub not connected"));
    }

    @Override
    public GithubConnection saveConnection(GithubConnection connection) {
        return repository.save(connection);
    }

    @Override
    public void disconnectCurrentUser() {

        User user = currentUserUtil.getCurrentUser();

        repository.deleteByUser(user);
    }
}