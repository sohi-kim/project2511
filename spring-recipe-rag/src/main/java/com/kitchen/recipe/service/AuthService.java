package com.kitchen.recipe.service;

import com.kitchen.recipe.dto.AuthRequest;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.exception.AppException;
import com.kitchen.recipe.repository.UserRepository;
import com.kitchen.recipe.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> register(AuthRequest request) {
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

        String accessToken = jwtTokenProvider.generateAccessTokenFromEmail(savedUser.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getEmail());

        return buildAuthResponse(savedUser, accessToken, refreshToken);
    }

    public Map<String, Object> login(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("사용자를 찾을 수 없습니다.", 404));

            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            String accessToken = jwtTokenProvider.generateAccessToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

            return buildAuthResponse(user, accessToken, refreshToken);

        } catch (BadCredentialsException e) {
            throw new AppException("이메일 또는 비밀번호가 잘못되었습니다.", 401);
        }
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
}
