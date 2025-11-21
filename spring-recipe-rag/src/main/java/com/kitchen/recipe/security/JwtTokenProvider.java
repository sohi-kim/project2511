package com.kitchen.recipe.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKeyString;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationInMs;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        // 환경변수에서 받은 secretKey 를 SecretKey 타입으로 변환
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }


    // Access Token 생성
    public String createAccessToken(String email) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);

        return Jwts.builder()
                .signWith(secretKey)
                .subject(email)
                .issuer("org.iclass")
                .issuedAt(new Date())
                .expiration(expiryDate)
                .compact();
    }

    public String createToken(Authentication authentication) {  // X
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);

        return Jwts.builder()
                .signWith(secretKey)
                .subject(userPrincipal.getUsername())
                .issuer("org.iclass")
                .issuedAt(new Date())
                .expiration(expiryDate)
                .compact();
    }

    // 클라이언트가 보낸 토큰(메소드 인자 String token)을 검증하는 메소드
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey).build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }

    // Access Token 생성
    public String generateAccessTokenFromEmail(String email) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);

        return Jwts.builder()
                .signWith(secretKey)
                .subject(email)
                .issuer("org.iclass")
                .issuedAt(new Date())
                .expiration(expiryDate)
                .compact();
    }

    // Refresh Token 생성 (유효기간 더 길게)
    public String generateRefreshToken(String email) {
        // Refresh Token 만료시간 = Access Token의 7배(예시)
        long refreshExpiration = jwtExpirationInMs * 7;

        Date expiryDate = new Date(System.currentTimeMillis() + refreshExpiration);

        return Jwts.builder()
                .signWith(secretKey)
                .subject(email)
                .issuer("org.iclass")
                .issuedAt(new Date())
                .expiration(expiryDate)
                .compact();
    }

    // Authentication → Access Token 생성(사용 중 ⭕)
    public String generateAccessToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        String email = userPrincipal.getUsername();

        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);

        return Jwts.builder()
                .signWith(secretKey)
                .subject(email)
                .issuer("org.iclass")
                .issuedAt(new Date())
                .expiration(expiryDate)
                .compact();
    }

    // RefreshToken 또는 AccessToken → Email(Subject) 추출
    public String getUserEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();   // subject = email
    }

    // Access Token 만료시간(ms) 반환
    public long getExpirationTime() {
        return jwtExpirationInMs;
}

}
