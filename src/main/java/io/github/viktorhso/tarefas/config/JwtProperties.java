package io.github.viktorhso.tarefas.config;

import java.nio.charset.StandardCharsets;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuração dos tokens JWT, lida de app.jwt.* (application.yml / variáveis de ambiente).
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, long expiracaoMinutos) {

    private static final int TAMANHO_MINIMO_SEGREDO = 32;

    public JwtProperties {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < TAMANHO_MINIMO_SEGREDO) {
            throw new IllegalStateException(
                    "app.jwt.secret (JWT_SECRET) precisa ter pelo menos " + TAMANHO_MINIMO_SEGREDO + " caracteres.");
        }
        if (expiracaoMinutos <= 0) {
            throw new IllegalStateException("app.jwt.expiracao-minutos precisa ser maior que zero.");
        }
    }
}
