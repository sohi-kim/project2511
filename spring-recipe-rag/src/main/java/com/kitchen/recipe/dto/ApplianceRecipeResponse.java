package com.kitchen.recipe.dto;

import lombok.Data;
import java.util.List;

@Data
public class ApplianceRecipeResponse {
    private String status;
    private Integer chunks;
    private List<String> recipeTitles;
    private String fileName;   // 또는 fileHash
}
