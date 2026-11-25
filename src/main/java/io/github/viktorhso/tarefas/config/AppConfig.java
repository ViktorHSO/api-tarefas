package io.github.viktorhso.tarefas.config;

import java.time.Clock;
import java.time.ZoneId;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(
        title = "API de Tarefas",
        version = "1.0.0",
        description = "Gerenciamento de tarefas pessoais com autenticação JWT. "
                + "Crie uma conta em POST /auth/registro, faça login em POST /auth/login "
                + "e use o token no botão Authorize."))
@SecurityScheme(name = "bearer-jwt", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class AppConfig {

    /** Relógio da aplicação, no fuso configurado. Usado para saber quais tarefas estão atrasadas. */
    @Bean
    Clock relogio(@Value("${app.fuso-horario}") String fusoHorario) {
        return Clock.system(ZoneId.of(fusoHorario));
    }
}
