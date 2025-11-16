package com.kitchen.recipe.repository;

import com.kitchen.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    Optional<Recipe> findByVectorDbId(String vectorDbId);
    
    @Query("SELECT r FROM Recipe r WHERE r.appliance = :appliance")
    List<Recipe> findByAppliance(@Param("appliance") String appliance);
    
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Recipe> searchByTitle(@Param("keyword") String keyword);
    
    @Query("SELECT r FROM Recipe r WHERE r.category = :category")
    List<Recipe> findByCategory(@Param("category") String category);
}
