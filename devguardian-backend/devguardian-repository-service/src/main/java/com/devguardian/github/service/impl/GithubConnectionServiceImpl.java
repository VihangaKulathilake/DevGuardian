package com.devguardian.github.service.impl;

import com.devguardian.security.CurrentUserUtil;
import com.devguardian.github.entity.GithubConnection;
import com.devguardian.github.repository.GithubConnectionRepository;
import com.devguardian.github.service.interfaces.GithubConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class GithubConnectionServiceImpl implements GithubConnectionService {

    private final GithubConnectionRepository repository;
    private final CurrentUserUtil currentUserUtil;

    @Override
    @Transactional(readOnly = true)
    public GithubConnection getCurrentUserConnection() {
        Long userId = currentUserUtil.getCurrentUser().getId();
        return repository.findByUserId(userId)
                .orElseThrow(() ->
                        new com.devguardian.common.exception.custom.ResourceNotFoundException("GitHub not connected"));
    }

    @Override
    public GithubConnection saveConnection(GithubConnection connection) {
        return repository.save(connection);
    }

    @Override
    public void disconnectCurrentUser() {
        Long userId = currentUserUtil.getCurrentUser().getId();
        repository.deleteByUserId(userId);
    }
}