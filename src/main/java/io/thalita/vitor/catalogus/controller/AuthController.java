package io.thalita.vitor.catalogus.controller;

import io.thalita.vitor.catalogus.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
class LoginRequest {
    private String email;
    private String password;
    // getters e setters
}

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
class RegisterRequest {
    private String email;
    private String password;
    // getters e setters
}
