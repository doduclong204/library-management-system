package com.campuslink.library.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourcesWebConfiguration implements WebMvcConfigurer {

    @Value("${upload.file.uri}")
    private String baseURI;

    @Value("${upload.file.image-uri}")
    private String imageURI;

    @Value("${upload.file.video-uri}")
    private String videoURI;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/storage/**")
                .addResourceLocations(baseURI);

        registry.addResourceHandler("/images/**")
                .addResourceLocations(imageURI);

        registry.addResourceHandler("/videos/**")
                .addResourceLocations(videoURI);
    }
}