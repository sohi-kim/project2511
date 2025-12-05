package com.kitchen.recipe.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

        recipeService.processUpload(applianceType, manufacturer, productName, totalPages, file);
        return ResponseEntity.ok("업로드 완료!");
    }
}
