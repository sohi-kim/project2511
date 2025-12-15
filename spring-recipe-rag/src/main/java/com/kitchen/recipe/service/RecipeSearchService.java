package com.kitchen.recipe.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kitchen.recipe.dto.RecipeDto;
import com.kitchen.recipe.entity.Recipe;
import com.kitchen.recipe.entity.SearchHistory;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.exception.AppException;
import com.kitchen.recipe.repository.RecipeRepository;
import com.kitchen.recipe.repository.SearchHistoryRepository;
import com.kitchen.recipe.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RecipeSearchService {

    private final RecipeRepository recipeRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final FavoriteRepository favoriteRepository;
    private final WebClient webClient;

    /**
     * RAG 시스템을 통한 레시피 검색
     */
    @Cacheable(value = "recipe_search", key = "#query + '_' + #appliance + '_' + #limit", 
               unless = "#result == null || #result.isEmpty()")
    public List<RecipeDto> searchRecipes(String query, String appliance, Integer limit, User currentUser) {
        try {
            // Python RAG 서비스 호출
            List<RecipeDto> recipes = callRagService(query, appliance, limit);

            // 검색 이력 저장
            recordSearchHistory(currentUser, query, recipes.size());

            // 사용자의 즐겨찾기 정보 추가
            return enrichWithFavoriteInfo(recipes, currentUser);

        } catch (Exception e) {
            log.error("RAG 서비스 호출 실패: {}", e.getMessage());
            throw new AppException("레시피 검색에 실패했습니다.", 500);
        }
    }

    /**
     * Python RAG 서비스에 검색 요청
     */
    private List<RecipeDto> callRagService(String query, String appliance, Integer limit) {
        Map<String, Object> request = new HashMap<>();
        request.put("query", query);
        request.put("appliance", appliance);
        request.put("limit", limit != null ? limit : 10);

        try {
            String response = webClient
                .post()
                .uri("/search")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            // JSON 파싱 및 Recipe 객체로 변환
            return parseRagResponse(response);

        } catch (Exception e) {
            log.error("Python RAG 서비스 호출 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * RAG 서비스 응답 파싱
     */
    private List<RecipeDto> parseRagResponse(String response) {
        List<RecipeDto> recipes = new ArrayList<>();
        // JSON 파싱 및 Recipe 객체 생성     //  ObjectMapper 사용
        ObjectMapper mapper = new ObjectMapper();
        try{
            recipes = mapper.readValue(response, new TypeReference<List<RecipeDto>> (){ });
        } catch(Exception e){
            log.info("파싱 오류: {}",e.getMessage());
        }
        return recipes;
    }

    /**
     * 검색 이력 저장
     */
    @Async
    public void recordSearchHistory(User user, String query, Integer resultCount) {
        if (user != null) {
            SearchHistory history = SearchHistory.builder()
                .user(user)
                .query(query)
                .resultCount(resultCount)
                .build();
            searchHistoryRepository.save(history);
        }
    }

    /**
     * 즐겨찾기 정보 추가
     */
    private List<RecipeDto> enrichWithFavoriteInfo(List<RecipeDto> recipes, User currentUser) {
        return recipes.stream()
            .peek(recipe -> {
                if (currentUser != null) {
                    boolean isFavorited = favoriteRepository
                        .existsByUserIdAndRecipeId(currentUser.getId(), recipe.getId());
                    recipe.setIsFavorited(isFavorited);
                } else {
                    recipe.setIsFavorited(false);
                }
            })
            .collect(Collectors.toList());
    }

    /**
     * 레시피 상세 조회
     */
    @Cacheable(value = "recipe_detail", key = "#id")
    public RecipeDto getRecipeDetail(Long id, User currentUser) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new AppException("레시피를 찾을 수 없습니다.", 404));

        RecipeDto dto = RecipeDto.from(recipe);
        
        if (currentUser != null) {
            boolean isFavorited = favoriteRepository
                .existsByUserIdAndRecipeId(currentUser.getId(), id);
            dto.setIsFavorited(isFavorited);
        }

        return dto;
    }

    /**
     * 가전제품별 레시피 목록
     */
    @Cacheable(value = "recipes_by_appliance", key = "#appliance")
    public List<RecipeDto> getRecipesByAppliance(String appliance, User currentUser) {
        List<Recipe> recipes = recipeRepository.findByAppliance(appliance);
        return enrichWithFavoriteInfo(
            recipes.stream().map(RecipeDto::from).collect(Collectors.toList()),
            currentUser
        );
    }

    /**
     * 카테고리별 레시피 목록
     */
    @Cacheable(value = "recipes_by_category", key = "#category")
    public List<RecipeDto> getRecipesByCategory(String category, User currentUser) {
        List<Recipe> recipes = recipeRepository.findByCategory(category);
        return enrichWithFavoriteInfo(
            recipes.stream().map(RecipeDto::from).collect(Collectors.toList()),
            currentUser
        );
    }

    /**
     * 사용자 검색 이력 조회
     */
    public List<Map<String, Object>> getSearchHistory(User user) {
        return searchHistoryRepository.findByUserOrderByCreatedAtDesc(user)
            .stream()
            .map(history -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", history.getId());
                map.put("query", history.getQuery());
                map.put("resultCount", history.getResultCount());
                map.put("createdAt", history.getCreatedAt());
                return map;
            })
            .collect(Collectors.toList());
    }
}
// redis 모든 키 삭제 : redis-cli FLUSHALL
