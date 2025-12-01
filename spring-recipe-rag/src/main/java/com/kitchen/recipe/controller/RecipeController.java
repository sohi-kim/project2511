package com.kitchen.recipe.controller;

import com.kitchen.recipe.dto.RecipeDto;
import com.kitchen.recipe.entity.User;
import com.kitchen.recipe.service.RecipeSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Slf4j
public class RecipeController {

    private final RecipeSearchService recipeSearchService;

    @GetMapping("/search")
    public ResponseEntity<?> searchRecipes(
        @RequestParam String query,
        @RequestParam(required = false) String appliance,
        @RequestParam(required = false, defaultValue = "10") Integer limit,
        Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        log.info("레시피 검색: query={}, appliance={}, user={}", query, appliance, currentUser.getEmail());
        
        List<RecipeDto> recipes = recipeSearchService.searchRecipes(query, appliance, limit, currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalCount", recipes.size());
        response.put("recipes", recipes);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecipeDetail(
        @PathVariable Long id,
        Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        RecipeDto recipe = recipeSearchService.getRecipeDetail(id, currentUser);
        
        return ResponseEntity.ok(recipe);
    }

    @GetMapping("/appliance/{appliance}")
    public ResponseEntity<?> getRecipesByAppliance(
        @PathVariable String appliance,
        Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        List<RecipeDto> recipes = recipeSearchService.getRecipesByAppliance(appliance, currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalCount", recipes.size());
        response.put("appliance", appliance);
        response.put("recipes", recipes);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getRecipesByCategory(
        @PathVariable String category,
        Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        List<RecipeDto> recipes = recipeSearchService.getRecipesByCategory(category, currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalCount", recipes.size());
        response.put("category", category);
        response.put("recipes", recipes);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getSearchHistory(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Map<String, Object>> history = recipeSearchService.getSearchHistory(currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalCount", history.size());
        response.put("searchHistory", history);
        
        return ResponseEntity.ok(response);
    }
}
