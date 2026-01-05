package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 全リクエストを許可
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            // ログイン画面を無効化
            .formLogin(form -> form.disable())
            // CSRFも今回は無効（開発用）
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
