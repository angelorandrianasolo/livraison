package com.example.delivery.security;

import com.example.delivery.config.CorsProperties;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Matrice des droits :
 * ADMIN (configuration, utilisateurs), MANAGER (gestion métier), OPERATOR (opérations quotidiennes),
 * USER (consultation des commandes et du suivi).
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";
    private static final String MANAGER = "MANAGER";
    private static final String OPERATOR = "OPERATOR";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final CorsProperties corsProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/actuator/health/**", "/actuator/health",
                                "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        .requestMatchers("/api/users/**").hasRole(ADMIN)

                        .requestMatchers(HttpMethod.GET, "/api/pricing/config").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/pricing/estimate").authenticated()
                        .requestMatchers("/api/pricing/**").hasRole(ADMIN)

                        .requestMatchers(HttpMethod.GET, "/api/zones/**").authenticated()
                        .requestMatchers("/api/zones/**").hasRole(ADMIN)

                        .requestMatchers("/api/statistics/**").hasAnyRole(ADMIN, MANAGER)

                        .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/orders/*/cancel").hasAnyRole(ADMIN, MANAGER)
                        .requestMatchers("/api/orders/**").hasAnyRole(ADMIN, MANAGER, OPERATOR)

                        .requestMatchers(HttpMethod.PUT, "/api/incidents/*/resolve").hasAnyRole(ADMIN, MANAGER)
                        .requestMatchers("/api/incidents/**").hasAnyRole(ADMIN, MANAGER, OPERATOR)

                        .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasAnyRole(ADMIN, MANAGER)
                        .requestMatchers("/api/customers/**").hasAnyRole(ADMIN, MANAGER, OPERATOR)

                        .requestMatchers(HttpMethod.PATCH, "/api/deliverers/*/status").hasAnyRole(ADMIN, MANAGER, OPERATOR)
                        .requestMatchers(HttpMethod.GET, "/api/deliverers/**").hasAnyRole(ADMIN, MANAGER, OPERATOR)
                        .requestMatchers("/api/deliverers/**").hasAnyRole(ADMIN, MANAGER)

                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthenticationFilter(jwtService, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(corsProperties.allowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
