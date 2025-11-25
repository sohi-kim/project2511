package com.kitchen.recipe.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
// @Component   // SecurityConfig 에서 빈으로 등록하므로 주석처리
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // 하나의 요청(Request)에 대해 필터가 단 한 번만 실행되도록 보장하는 역할
    //FORWARD, INCLUDE, ERROR 같은 서블릿 디스패처 동작에서도 필터가 한 번만 실행

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String email = tokenProvider.getUsernameFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null,
                        userDetails.getAuthorities());
                // authentication.setDetails(
                //     new WebAuthenticationDetailsSource().buildDetails(request)
                // );
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("인증된 사용자: {}", authentication.getName());
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }
    private String getJwtFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();  // ← 쿠키 배열 가져오기
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {  // ← accessToken 찾기
                    return cookie.getValue();  // ← 토큰 값 반환
                }
            }
        }
        
        return null;
    }
    // private String getJwtFromRequest(HttpServletRequest request) {
    //     String bearerToken = request.getHeader("Authorization");
    //     if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
    //         return bearerToken.substring(7);
    //     }
    //     return null;
    // }
}
