package com.example.carecommerce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration public class WebConfig implements WebMvcConfigurer {
    @Value("${app.upload-dir:uploads/profiles}") private String uploadDir;
    @Override public void addResourceHandlers(ResourceHandlerRegistry registry){registry.addResourceHandler("/uploads/profiles/**").addResourceLocations("file:"+uploadDir+"/");}
}
