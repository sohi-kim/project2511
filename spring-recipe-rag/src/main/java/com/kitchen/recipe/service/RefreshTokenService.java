package com.kitchen.recipe.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kitchen.recipe.entity.RefreshToken;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Transactional
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
        // db 에 저장된 token update        
        Optional<RefreshToken> oldToken = refreshTokenRepository.findByUser( user);
        if (oldToken.isPresent()) {
            refreshTokenRepository.deleteByUser(user);   //실제 DB 반영은 트랜잭션 커밋 시점
            refreshTokenRepository.flush();   // 즉시 db 반영
        }   
        // oldToken.ifPresent(token -> refreshTokenRepository.delete(token));
        // oldToken.ifPresent(refreshTokenRepository::delete);

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

