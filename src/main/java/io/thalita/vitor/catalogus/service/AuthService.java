package io.thalita.vitor.catalogus.service;

import io.thalita.vitor.catalogus.model.User;
import io.thalita.vitor.catalogus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean login(String email, String password) {
        return userRepository.findByEmail(email)
                .map(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElse(false);
    }

    public User register(String email, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email já cadastrado!");
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(encodedPassword);
        return userRepository.save(newUser);
    }
}
