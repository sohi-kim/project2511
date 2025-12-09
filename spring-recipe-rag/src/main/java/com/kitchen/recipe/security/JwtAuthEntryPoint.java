package com.kitchen.recipe.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        // JwtAuthenticationFilter에서 설정한 에러 타입 가져오기
        String error = (String) request.getAttribute("error");

        if (error == null) error = "INVALID_TOKEN";

        response.getWriter().write(
                "{\"error\": \"" + error + "\"}"
        );
    }
}