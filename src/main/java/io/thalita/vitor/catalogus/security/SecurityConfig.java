package io.thalita.vitor.catalogus.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(auth -> auth
                        // Rotas da API
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/book/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // Arquivos do Frontend
                        .requestMatchers("/", "/index-figma.html", "/dashboard-figma.html").permitAll()
                        .requestMatchers("/index.html**", "/dashboard.html**").permitAll()
                        .requestMatchers("/*.css", "/*.js").permitAll()
                        .requestMatchers("/css/**", "/js/**").permitAll()
                        .requestMatchers("/images/**", "/fonts/**", "/assets/**").permitAll()
                        .requestMatchers("/*.png", "/*.jpg", "/*.svg", "/*.ico").permitAll()

                        // Outras rotas precisam autenticação
                        .anyRequest().permitAll()
                )
                .httpBasic(basic -> {});

        return http.build();
    }
}