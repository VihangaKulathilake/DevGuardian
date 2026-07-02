package com.devguardian.github.service.interfaces;

import com.devguardian.github.entity.GithubConnection;

public interface GithubConnectionService {

    GithubConnection getCurrentUserConnection();

    GithubConnection saveConnection(GithubConnection connection);

    void disconnectCurrentUser();
}