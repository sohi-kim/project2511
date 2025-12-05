package com.kitchen.recipe.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kitchen.recipe.entity.ApplianceRecipe;

@Repository
public interface ApplianceRepository extends JpaRepository<ApplianceRecipe, Long> {
    Optional<ApplianceRecipe> findByFileHash(String fileHash);
}
