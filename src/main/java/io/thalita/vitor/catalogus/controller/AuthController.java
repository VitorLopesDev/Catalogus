package io.thalita.vitor.catalogus.controller;

import io.thalita.vitor.catalogus.model.User;
import io.thalita.vitor.catalogus.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        boolean success = authService.login(request.getEmail(), request.getPassword());
        if(success != true){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("menssage", "Credenciais inválidas."));
        }
        return ResponseEntity.ok(Map.of("menssage", "Login realizado com sucesso.",
                "email", request.getEmail()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request.getNickName(), request.getEmail(), request.getPassword());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensage", "Usuário registrado com sucesso.", "nickname", user.getNickName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("menssage", e.getMessage()));
        }
    }
}
