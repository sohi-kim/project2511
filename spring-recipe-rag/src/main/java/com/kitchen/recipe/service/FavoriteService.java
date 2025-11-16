package com.kitchen.recipe.service;

import com.kitchen.recipe.dto.RecipeDto;
import com.kitchen.recipe.entity.Favorite;
import com.kitchen.recipe.entity.Recipe;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.exception.AppException;
import com.kitchen.recipe.repository.FavoriteRepository;
import com.kitchen.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RecipeRepository recipeRepository;

    /**
     * 즐겨찾기 추가
     */
    @CacheEvict(value = {"user_favorites", "recipe_search"}, allEntries = true)
    public void addFavorite(Long recipeId, User user) {
        if (favoriteRepository.existsByUserIdAndRecipeId(user.getId(), recipeId)) {
            throw new AppException("이미 즐겨찾기에 추가된 레시피입니다.", 400);
        }

        Recipe recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new AppException("레시피를 찾을 수 없습니다.", 404));

        Favorite favorite = Favorite.builder()
            .user(user)
            .recipe(recipe)
            .build();

        favoriteRepository.save(favorite);
        log.info("즐겨찾기 추가: userId={}, recipeId={}", user.getId(), recipeId);
    }

    /**
     * 즐겨찾기 삭제
     */
    @CacheEvict(value = {"user_favorites", "recipe_search"}, allEntries = true)
    public void removeFavorite(Long recipeId, User user) {
        favoriteRepository.deleteByUserIdAndRecipeId(user.getId(), recipeId);
        log.info("즐겨찾기 삭제: userId={}, recipeId={}", user.getId(), recipeId);
    }

    /**
     * 사용자의 즐겨찾기 목록 조회
     */
    @Cacheable(value = "user_favorites", key = "#user.id")
    public List<RecipeDto> getUserFavorites(User user) {
        return favoriteRepository.findByUser(user)
            .stream()
            .map(favorite -> {
                RecipeDto dto = RecipeDto.from(favorite.getRecipe());
                dto.setIsFavorited(true);
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * 즐겨찾기 여부 확인
     */
    public boolean isFavorited(Long recipeId, User user) {
        return favoriteRepository.existsByUserIdAndRecipeId(user.getId(), recipeId);
    }

    /**
     * 사용자의 즐겨찾기 개수
     */
    public Long getFavoriteCount(User user) {
        return (long) favoriteRepository.findByUser(user).size();
    }
}
