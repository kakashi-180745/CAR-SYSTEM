package com.example.carecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService=jwtService; this.userDetailsService=userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header=request.getHeader("Authorization");
        if(header!=null && header.startsWith("Bearer ")) {
            String token=header.substring(7);
            if(jwtService.isValid(token)) {
                String email=jwtService.extractEmail(token);
                if(SecurityContextHolder.getContext().getAuthentication()==null) {
                    try {
                        UserDetails details=userDetailsService.loadUserByUsername(email);
                        var auth=new UsernamePasswordAuthenticationToken(details,null,details.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } catch (RuntimeException ignored) {
                        // User was removed or the token no longer maps to an account.
                    }
                }
            }
        }
        chain.doFilter(request,response);
    }
}
