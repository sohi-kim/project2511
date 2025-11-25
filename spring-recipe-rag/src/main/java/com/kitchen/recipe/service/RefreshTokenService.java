package com.kitchen.recipe.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.kitchen.recipe.entity.RefreshToken;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    

    public RefreshToken createRefreshToken(User user) {
        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build();

        return refreshTokenRepository.save(token);
    }

    public Optional<RefreshToken> validateRefreshToken(String tokenValue) {
        return refreshTokenRepository.findByToken(tokenValue)
                .filter(rt -> rt.getExpiryDate().isAfter(LocalDateTime.now()));
    }

    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}

