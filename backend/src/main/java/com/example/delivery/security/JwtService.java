package com.example.delivery.security;

import com.example.delivery.config.JwtProperties;
import com.example.delivery.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public record IssuedToken(String value, Instant expiresAt) {
    }

    private final SecretKey key;
    private final Duration validity;
    private final Clock clock;

    public JwtService(JwtProperties properties, Clock clock) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(properties.secret()));
        this.validity = Duration.ofMinutes(properties.expirationMinutes());
        this.clock = clock;
    }

    public IssuedToken generate(AppUser user) {
        Instant now = clock.instant();
        Instant expiresAt = now.plus(validity);
        String token = Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
        return new IssuedToken(token, expiresAt);
    }

    /** Lève une JwtException si le jeton est invalide, falsifié ou expiré. */
    public String extractUsername(String token) {
        Claims claims = Jwts.parser().verifyWith(key).clock(() -> Date.from(clock.instant()))
                .build().parseSignedClaims(token).getPayload();
        return claims.getSubject();
    }
}
