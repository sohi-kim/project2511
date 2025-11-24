package com.kitchen.recipe.controller;

import com.kitchen.recipe.dto.AuthRequest;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
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
                .secure(false) // 개발 환경에서는 false, 운영 환경에서는 true로 설정
                .path("/")
                .maxAge(60 * 15)
                .sameSite("Lax")  
                // 개발 환경에서 CSRF 공격 방어. Lax: 동일 사이트 및 일부 교차 사이트 요청에서만 쿠키 전송
                .build();
        // 아래 설정은 개발/ 운영환경에서 따라
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokens.get("refreshToken"))
                .httpOnly(true)
                .path("/auth/refresh")   
                // .secure(true)  //https 환경에서만 전송
                .secure(false)
                .sameSite("Lax")  // cross-site 요청에서도 쿠키 전송 허용
                //쿠키의 domain/path/sameSite 속성으로 쿠키가 전송되는 범위를 제한할 수 있다.CORS 허용과 맞아야 함.
                .maxAge(60 * 60 * 24 * 14)
                .build();
        /*
        브라우저는 쿠키를 저장하지만,
        React 코드에서는 그 쿠키 값을 읽거나 조작할 수 없다.
        하지만 서버 요청 시 브라우저가 자동(withCredentials: true)으로 쿠키를 붙여 보낸다.(XSS 공격 방어)
        # localStroage, sesionStorage 는 JS 코드에서 접근 가능하기 때문에 XSS 공격에 취약하다.
        */        

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
    public ResponseEntity<?> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshTokenCookieValue,
            @AuthenticationPrincipal User userDetails
    ) {
        // 1) DB에서 Refresh Token 삭제
        authService.logout(userDetails.getUsername());

        // 2) 쿠키 삭제 (Access Token, Refresh Token)
        ResponseCookie clearAccessToken = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false) // 개발환경: false, 운영환경: true
                .path("/")
                .maxAge(0)     // 즉시 삭제
                .sameSite("Lax")
                .build();

        ResponseCookie clearRefreshToken = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/auth/refresh")
                .maxAge(0)
                .sameSite("None")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearAccessToken.toString())
                .header(HttpHeaders.SET_COOKIE, clearRefreshToken.toString())
                .body("로그아웃 완료");
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "recipe-rag-service");
        return ResponseEntity.ok(response);
    }
}
