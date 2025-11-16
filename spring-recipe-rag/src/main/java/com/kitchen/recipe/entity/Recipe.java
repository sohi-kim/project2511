package com.kitchen.recipe.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recipes", indexes = {
    @Index(name = "idx_appliance", columnList = "appliance"),
    @Index(name = "idx_title", columnList = "title"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String appliance;  // 전기밥솥, 쥬서기, 믹서기 등

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(length = 100)
    private String category;

    @Column(name = "cuisine_type", length = 50)
    private String cuisineType;

    @Column(name = "difficulty_level", length = 20)
    private String difficultyLevel;

    @Column(name = "prep_time")
    private Integer prepTime;  // 분 단위

    @Column(name = "cook_time")
    private Integer cookTime;  // 분 단위

    @Column(name = "serving_size")
    private Integer servingSize;

    @Column(name = "vectordb_id")
    private String vectorDbId;  // Pinecone의 문서 ID

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
