package com.kitchen.recipe.dto;

import lombok.*;
import com.kitchen.recipe.entity.Recipe;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeDto {
    private Long id;
    private String title;
    private String description;
    private String appliance;
    private String ingredients;
    private String instructions;
    private String category;
    private String cuisineType;
    private String difficultyLevel;
    private Integer prepTime;
    private Integer cookTime;
    private Integer servingSize;
    private Boolean isFavorited;
    private LocalDateTime createdAt;

    public static RecipeDto from(Recipe recipe) {
        return RecipeDto.builder()
            .id(recipe.getId())
            .title(recipe.getTitle())
            .description(recipe.getBookName())
            .appliance(recipe.getAppliance())
            .ingredients(recipe.getIngredients())
            .instructions(recipe.getInstructions())
            .category(recipe.getCategory())
            .cuisineType(recipe.getCuisineType())
            .difficultyLevel(recipe.getDifficultyLevel())
            .prepTime(recipe.getPrepTime())
            .cookTime(recipe.getCookTime())
            .servingSize(recipe.getServingSize())
            .createdAt(recipe.getCreatedAt())
            .build();
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class RecipeSearchRequest {
    private String query;
    private String appliance;
    private Integer limit;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class RecipeSearchResponse {
    private Integer totalCount;
    private java.util.List<RecipeDto> recipes;
    private Double relevanceScore;
}
