package com.kitchen.recipe.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequest {
    private String email;
    private String password;
    private String name;  // 회원가입용
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class AuthResponse {
    private Long userId;
    private String email;
    private String name;
    private String token;
    private String refreshToken;
    private Long expiresIn;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class RefreshTokenRequest {
    private String refreshToken;
}
