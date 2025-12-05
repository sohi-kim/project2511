package com.kitchen.recipe.controller;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kitchen.recipe.dto.AuthRequest;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationInMs;
  
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        log.info("회원가입 요청: {}", request.getEmail());
        String email = authService.register(request);
        if(email !=null && email.length() !=0)
                return ResponseEntity.ok(Map.of("result","success"));
        else    
                return ResponseEntity.badRequest().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        Authentication authentication=authService.authenticate(request.getEmail(), request.getPassword());
        Map<String, Object> resp = authService.login(authentication);

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", (String) resp.get("accessToken"))
                .httpOnly(true)
                .secure(true) // 개발 환경에서는 false, 운영 환경에서는 true로 설정 가능
                .path("/")
                .maxAge(jwtExpirationInMs / 1000)    // 초 단위
                .sameSite("Lax")  
                // 개발 환경에서 CSRF 공격 방어. Lax: 동일 사이트 및 일부 교차 사이트 요청에서만 쿠키 전송
                .build();
        //  운영환경
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", (String)resp.get("refreshToken"))
                .httpOnly(true)
                .secure(true) // 운영 환경에서 true로 설정이 필수
                .path("/")   // 🧡 리액트 post 요청 경로와 맞춰야 함
                .sameSite("None")  // cross-site 요청에서도 쿠키 전송 허용
                .maxAge(60 * 60 * 24 * 14)
                .build();
                /*
                브라우저는 쿠키를 저장하지만,
                React 코드에서는 그 쿠키 값을 읽거나 조작할 수 없다.
                하지만 서버 요청 시 브라우저가 자동(withCredentials: true)으로 쿠키를 붙여 보낸다.(XSS 공격 방어)
                # localStroage, sesionStorage 는 JS 코드에서 접근 가능하기 때문에 XSS 공격에 취약하다.
                */        
               log.info("로그인 시간 : {}", LocalDateTime.now(ZoneId.of("UTC")));
               return ResponseEntity.ok()
               .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
               .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
               .body(resp );
        }
        /*
        //쿠키의 domain/path/sameSite 속성으로 쿠키가 전송되는 범위를 제한할 수 있다.CORS 허용과 맞아야 함.
        SameSite 속성에 따른 "전송"이라는 표현은 브라우저가 서버로 HTTP 요청을 보낼 때 
        쿠키를 함께 첨부하는 동작을 의미합니다. 즉:
방향: 브라우저 → 서버 사용자가 브라우저에서 어떤 요청(예: API 호출, 페이지 이동)을 보낼 때,
 브라우저가 조건에 따라 쿠키를 붙여서 서버로 전달합니다.
SameSite=Strict → 동일 사이트 요청에서만 쿠키 전송.
SameSite=Lax → 대부분의 동일 사이트 요청 + 일부 cross-site GET 요청에서 전송.
SameSite=None; Secure → 모든 요청(크로스 사이트 포함)에서 전송, 단 HTTPS 필요.
            인증서버가 다른 도메인일 수 있음.
*/

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken",required = false) 
                                String refreshToken) {
        log.info("토큰 재발급 요청 받음 : {}",refreshToken);
        
        if(refreshToken == null) {
                return ResponseEntity.status(401).body(Map.of("message", "유효하지 않은 Refresh Token"));
        }
        
        String newAccessToken = authService.refresh(refreshToken);
        ResponseCookie newAccessCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(jwtExpirationInMs / 1000)
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
        //     Authentication authentication
    ) {
        // 1) DB에서 Refresh Token 삭제
        log.info("로그아웃 요청: {}-{}", userDetails.getName(), refreshTokenCookieValue);
        authService.logout(userDetails.getUsername());

        // 2) 쿠키 삭제 (Access Token, Refresh Token)
        ResponseCookie clearAccessToken = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true) 
                .path("/")
                .maxAge(0)     // 즉시 삭제
                .sameSite("Lax")
                .build();

        ResponseCookie clearRefreshToken = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearAccessToken.toString())
                .header(HttpHeaders.SET_COOKIE, clearRefreshToken.toString())
                .body(Map.of("message", "로그아웃 성공"));
    }

        // @GetMapping("/me")
        // public ResponseEntity<?> me(Authentication auth) {
        // if (auth == null) return ResponseEntity.status(401).build();
        // log.info("me : {}",auth);
        // User user = (User) auth.getPrincipal();
        // return ResponseEntity.ok(Map.of(
        // "email", user.getUsername(),
        // "name", user.getName()
        // ));
        // }
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {

    // 1) 인증 객체 존재 여부 검사
    if (auth == null || !auth.isAuthenticated()) {
        return ResponseEntity.status(401).build();
    }

    // 2) anonymousUser 처리 (permitAll 문제나 인증 실패 시)
    Object principal = auth.getPrincipal();
    if (principal == null || principal.equals("anonymousUser")) {
        return ResponseEntity.status(401).build();
    }

    // 3) principal 이 UserDetails(User 엔티티) 타입인지 확인
    if (!(principal instanceof User)) {
        return ResponseEntity.status(401).build();
    }

    User user = (User) principal;

    // 4) 필드가 null 인 경우에도 안전하도록 값 처리
    String email = user.getUsername() != null ? user.getUsername() : "";
    String name = user.getName() != null ? user.getName() : "";
    log.info("me user : {}",user);
    return ResponseEntity.ok(Map.of(
            "email", email,
            "name", name
    ));
}


    @GetMapping("/health")
    public ResponseEntity<?> health() {
         log.info("health : {}",LocalDateTime.now(ZoneId.of("UTC")));
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "recipe-rag-service");
        return ResponseEntity.ok(response);
    }
}
