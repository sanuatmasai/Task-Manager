package com.taskmanager.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI taskManagerOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Task Manager API")
                        .description("API for Natural Language Task Management System")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("API Support")
                                .email("support@taskmanager.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")));
    }
}
