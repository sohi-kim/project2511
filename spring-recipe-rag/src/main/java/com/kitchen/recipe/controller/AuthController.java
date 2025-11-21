package com.kitchen.recipe.controller;

import com.kitchen.recipe.dto.AuthRequest;
import com.kitchen.recipe.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        log.info("회원가입 요청: {}", request.getEmail());
        Map<String, Object> response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    // @PostMapping("/login")
    // public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
    //     log.info("로그인 요청: {}", request.getEmail());
    //     Map<String, Object> response = authService.login(request);
    //     return ResponseEntity.ok(response);
    // }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        Map<String, String> tokens = authService.login(request);

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", tokens.get("accessToken"))
                .httpOnly(true)
                // .secure(true)
                .path("/")
                .maxAge(60 * 15)
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokens.get("refreshToken"))
                .httpOnly(true)
                // .secure(true)
                .path("/auth/refresh")
                .maxAge(60 * 60 * 24 * 14)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body("로그인 성공");
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue("refreshToken") String refreshToken) {

        String newAccessToken = authService.refresh(refreshToken);

        ResponseCookie newAccessCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(60 * 15)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                .body("Access Token 재발급 완료");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue("accessToken") String accessToken) {
        return ResponseEntity.ok("로그아웃 완료");
    }
    // @PostMapping("/refresh")
    // public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
    //     String refreshToken = request.get("refreshToken");
    //     Map<String, Object> response = authService.refreshAccessToken(refreshToken);
    //     return ResponseEntity.ok(response);
    // }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "recipe-rag-service");
        return ResponseEntity.ok(response);
    }
}
