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
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.kitchen.recipe.service.CustomUserDetailsService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import java.io.IOException;

import javax.security.sasl.AuthenticationException;

@Slf4j
@RequiredArgsConstructor
// @Component   // SecurityConfig 에서 빈으로 등록하므로 주석처리
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // 하나의 요청(Request)에 대해 필터가 단 한 번만 실행되도록 보장하는 역할
    //FORWARD, INCLUDE, ERROR 같은 서블릿 디스패처 동작에서도 필터가 한 번만 실행

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            log.info("JwtAuthenticationFilter 동작 중...");
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
            // ⬇ JwtAuthenticationFilter → token 검사 → 만료/유효성 오류 → 401 리턴
        }catch (ExpiredJwtException e) {
            request.setAttribute("error", "TOKEN_EXPIRED");
            throw new AuthenticationException("TOKEN_EXPIRED") {};
        } catch (JwtException e) {
            request.setAttribute("error", "INVALID_TOKEN");
            throw new AuthenticationException("INVALID_TOKEN") {};
        } catch (IllegalArgumentException e) {
            // ★ 기타 JWT 오류 → 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid JWT");
            return;
        }
        filterChain.doFilter(request, response);
    }
    private String getJwtFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();  // ← 쿠키 배열 가져오기
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {  // ← accessToken 찾기
                    log.info("coolie value : {}",cookie.getValue());
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
