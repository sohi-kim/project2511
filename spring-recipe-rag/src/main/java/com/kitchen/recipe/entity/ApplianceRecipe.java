package com.kitchen.recipe.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appliance_recipe")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ApplianceRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String applianceType;
    private String manufacturer;
    private String productName;
    private String fileName;
    private int totalPages;
    private String uploadStatus;
    private String fileHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
