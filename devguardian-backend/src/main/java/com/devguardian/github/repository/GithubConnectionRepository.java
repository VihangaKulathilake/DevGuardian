package com.devguardian.github.repository;

import com.devguardian.auth.entity.User;
import com.devguardian.github.entity.GithubConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GithubConnectionRepository extends JpaRepository<GithubConnection, Long> {

    Optional<GithubConnection> findByUser(User user);

    boolean existsByUser(User user);

    void deleteByUser(User user);
}