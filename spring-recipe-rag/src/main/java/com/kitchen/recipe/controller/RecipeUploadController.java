package com.kitchen.recipe.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kitchen.recipe.entity.ApplianceRecipe;
import com.kitchen.recipe.service.RecipeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class RecipeUploadController {

    private final RecipeService recipeService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadRecipe(
            @RequestParam String applianceType,
            @RequestParam String manufacturer,
            @RequestParam String productName,
            @RequestParam int totalPages,
            @RequestParam MultipartFile file) {

       try { 
        ApplianceRecipe prep = recipeService.prepSave(applianceType, manufacturer, productName, totalPages);
        ApplianceRecipe result = recipeService.processUpload(prep, file);
        
        
        return ResponseEntity.ok(Map.of(
                "status", "COMPLETED",
                "id", result.getId(),
                "message", "등록 및 RAG 인덱싱 완료"
        ));
        }catch(Exception e){
            return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));
        }
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts(@RequestParam String category) {

        List<ApplianceRecipe> list = recipeService.getProductsByCategory(category);
        return ResponseEntity.ok(list);
    }
}
