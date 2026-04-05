package com.vehicleseller.backend.repository;

import com.vehicleseller.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Email eken user kenek hoyanna me method eka passe wadagath wei
    Optional<User> findByEmail(String email);

    User findByEmailAndPassword(String email, String password);
}