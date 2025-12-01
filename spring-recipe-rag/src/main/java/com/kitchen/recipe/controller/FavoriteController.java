package com.kitchen.recipe.controller;

import com.kitchen.recipe.dto.RecipeDto;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Slf4j
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{recipeId}")
    public ResponseEntity<?> addFavorite(
        @PathVariable Long recipeId,
        Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        favoriteService.addFavorite(recipeId, currentUser);
        
        log.info("즐겨찾기 추가: userId={}, recipeId={}", currentUser.getId(), recipeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "즐겨찾기에 추가되었습니다.");
        response.put("recipeId", recipeId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<?> removeFavorite(
        @PathVariable Long recipeId,
        Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        favoriteService.removeFavorite(recipeId, currentUser);
        
        log.info("즐겨찾기 삭제: userId={}, recipeId={}", currentUser.getId(), recipeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "즐겨찾기에서 삭제되었습니다.");
        response.put("recipeId", recipeId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getFavorites(Authentication authentication) {
        log.info("getFavorites 💥💥");
        User currentUser = (User) authentication.getPrincipal();
        List<RecipeDto> favorites = favoriteService.getUserFavorites(currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalCount", favorites.size());
        response.put("favorites", favorites);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{recipeId}")
    public ResponseEntity<?> checkFavorite(
        @PathVariable Long recipeId,
        Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        boolean isFavorited = favoriteService.isFavorited(recipeId, currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("recipeId", recipeId);
        response.put("isFavorited", isFavorited);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<?> getFavoriteCount(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long count = favoriteService.getFavoriteCount(currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }
}
