package com.kiandelamarre.dashboard.config;

import jakarta.servlet.http.Cookie;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public InMemoryUserDetailsManager user() {
        return new InMemoryUserDetailsManager(
                User.withUsername("admin")
                        .password("{noop}password")
                        .authorities("read")
                        .build()
        );
    }

    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        return request -> {
            String uri = request.getRequestURI();

            if (!uri.startsWith("/api/")) {
                return null;
            }

            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("accessToken".equals(cookie.getName())) {
                        return cookie.getValue();
                    }
                }
            }
            return null;
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, BearerTokenResolver bearerTokenResolver) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**", "/monitor/**").permitAll()
                        // ADDED PWA files here:
                        .requestMatchers(
                                "/", "/index.html", "/favicon.svg", "/favicon.ico",
                                "/apple-touch-icon.png", "/manifest.json",
                                "/manifest.webmanifest", "/sw.js", "/workbox-*.js"
                        ).permitAll()
                        .requestMatchers("/assets/**", "/dashboard/**", "/login").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                )
                .logout(logout -> logout.disable())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(Customizer.withDefaults())
                        .bearerTokenResolver(bearerTokenResolver)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}