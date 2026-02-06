package io.thalita.vitor.catalogus.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Bean para criptografia de senha
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configuração de segurança
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desabilita CSRF para APIs REST
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // Permite o uso de frames (necessário pro H2 Console)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/auth/register", "/h2-console/**", "/book/**").permitAll() // Rotas liberadas
                        .anyRequest().authenticated() // Outras rotas precisam de login
                )
                .httpBasic(basic -> {}); // Autenticação básica temporária (vamos trocar por JWT depois)

        return http.build();
    }
}
