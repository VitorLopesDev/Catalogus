package io.thalita.vitor.catalogus.repository;

import io.thalita.vitor.catalogus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
