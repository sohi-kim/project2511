package com.kitchen.recipe.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    @Value("${rag-service.url:http://localhost:8000}")
    private String ragServiceUrl;

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
         HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 60000)     // 연결 시도 30초
                .responseTimeout(Duration.ofMinutes(10))                  // 응답 대기 10분
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(300))     // 읽기 타임아웃 300초
                            .addHandlerLast(new WriteTimeoutHandler(300))    // 쓰기 타임아웃 300초
                );

        return WebClient.builder()
                .baseUrl(ragServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();

    }
}
