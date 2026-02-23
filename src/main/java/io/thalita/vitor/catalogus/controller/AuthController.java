package io.thalita.vitor.catalogus.controller;

import io.thalita.vitor.catalogus.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        boolean success = authService.login(request.getEmail(), request.getPassword());
        return success ? "Login realizado com sucesso!" : "Credenciais inválidas.";
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        try {
            authService.register(request.getEmail(), request.getPassword());
            return "Usuário registrado com sucesso!";
        } catch (Exception e) {
            return e.getMessage();
        }
    }
}
