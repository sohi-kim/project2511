package com.kitchen.recipe.service;

import com.kitchen.recipe.dto.AuthRequest;
import com.kitchen.recipe.entity.RefreshToken;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.exception.AppException;
import com.kitchen.recipe.repository.UserRepository;
import com.kitchen.recipe.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public Authentication authenticate(String email, String password) {
        return authManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
    }

    public String register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("이미 가입된 이메일입니다.", 400);
        }

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .name(request.getName())
            .role("ROLE_USER")
            .build();

        User savedUser = userRepository.save(user);

        // String accessToken = jwtTokenProvider.generateAccessTokenFromEmail(savedUser.getEmail());
        // String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getEmail());

        // return buildAuthResponse(savedUser, accessToken, refreshToken);
        return savedUser.getEmail();
    }

    public Map<String, Object> login(Authentication authentication) {
        try {
            
            User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new AppException("사용자를 찾을 수 없습니다.", 404));
           
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            String accessToken = jwtTokenProvider.generateAccessToken(authentication);
            // String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

             // *. SecurityContext에 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("User authenticated: {}, {}", user.getEmail(), authentication.getName());


            return buildAuthResponse(user, accessToken, refreshToken.getToken());
            // return Map.of("accessToken", accessToken,"refreshToken", refreshToken.getToken());

        } catch (BadCredentialsException e) {
            throw new AppException("이메일 또는 비밀번호가 잘못되었습니다.", 401);
        }
    }

    // Access Token 재발급 - New
    public String refresh(String refreshTokenValue) {
        RefreshToken refresh = refreshTokenService.validateRefreshToken(refreshTokenValue)
                .orElseThrow(() -> new RuntimeException("RefreshToken invalid"));

        return jwtTokenProvider.createAccessToken(refresh.getUser().getEmail());
    }

        // 로그아웃
    public void logout(String email) {
        log.info("logout service: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow();
        refreshTokenService.deleteByUser(user);
    }

    public Map<String, Object> refreshAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AppException("유효하지 않은 리프레시 토큰입니다.", 401);
        }

        String email = jwtTokenProvider.getUserEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException("사용자를 찾을 수 없습니다.", 404));

        String newAccessToken = jwtTokenProvider.generateAccessTokenFromEmail(email);

        return buildAuthResponse(user, newAccessToken, refreshToken);
    }

    private Map<String, Object> buildAuthResponse(User user, String accessToken, String refreshToken) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("token", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("expiresIn", jwtTokenProvider.getExpirationTime());
        return response;
    }

    // ============================================================
    // ✅ 쿠키 설정 헬퍼 메서드 (개발 환경)
    // ============================================================
    private void addCookiesToResponse(
            HttpServletResponse response,
            String accessToken,
            String refreshToken) {
        
        // ✅ accessToken 쿠키
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)        // JavaScript에서 접근 불가
                .secure(false)         // 개발: false, 운영: true (HTTPS)
                .path("/")             // ← 모든 경로에서 전송 (중요!)
                .maxAge(60 * 3)        // 3분 (15분: 60*15)
                .sameSite("Lax")       // 개발: Lax, 운영: Strict
                .build();
        
        // ✅ refreshToken 쿠키
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)        // JavaScript에서 접근 불가
                .secure(false)         // 개발: false, 운영: true (HTTPS)
                .path("/")             // ← "/" 변경! (이전: "/auth/refresh")
                .maxAge(60 * 60 * 24 * 7)  // 7일
                .sameSite("Lax")       // 개발: Lax, 운영: Strict
                .build();
        
        // ✅ 응답 헤더에 쿠키 추가
        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
        
        log.debug("Cookies added to response headers");
    }
    
    // ============================================================
    // ✅ 운영 환경용 쿠키 설정 메서드
    // ============================================================
    private void addCookiesToResponseProduction(HttpServletResponse response, String accessToken, String refreshToken) {
        
        // ✅ accessToken 쿠키 (운영)
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)        // JavaScript에서 접근 불가
                .secure(true)          // 운영: HTTPS만
                .path("/")             // 모든 경로
                .maxAge(60 * 15)       // 15분
                .sameSite("Strict")    // 최고 보안 (같은 사이트만)
                .domain("example.com") // 도메인 명시 (선택)
                .build();
        
        // ✅ refreshToken 쿠키 (운영)
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)        // JavaScript에서 접근 불가
                .secure(true)          // 운영: HTTPS만
                .path("/")             // 모든 경로
                .maxAge(60 * 60 * 24 * 7)  // 7일
                .sameSite("Strict")    // 최고 보안
                .domain("example.com") // 도메인 명시 (선택)
                .build();
        
        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    
}
