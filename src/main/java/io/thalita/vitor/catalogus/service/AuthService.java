package io.thalita.vitor.catalogus.service;

import io.thalita.vitor.catalogus.model.User;
import io.thalita.vitor.catalogus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean login(String username, String password) {
        User user = userRepository.findByEmail(username);

        if (user == null) {
            return false;
        }

        return passwordEncoder.matches(password, user.getPassword());
    }

    public void register(String username, String password) {
        if (userRepository.findByEmail(username) != null) {
            throw new RuntimeException("Usuário já existe");
        }

        User user = new User();
        user.setEmail(username);
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);
    }
}
