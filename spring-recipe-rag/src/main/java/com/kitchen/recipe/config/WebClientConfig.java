package com.kitchen.recipe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${rag-service.url:http://localhost:8000}")
    private String ragServiceUrl;

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder
            .baseUrl(ragServiceUrl)
            .build();
    }
}
