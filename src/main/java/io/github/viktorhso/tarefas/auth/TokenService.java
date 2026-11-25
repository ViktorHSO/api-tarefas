package io.github.viktorhso.tarefas.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import io.github.viktorhso.tarefas.auth.AuthDtos.TokenResponse;
import io.github.viktorhso.tarefas.config.JwtProperties;
import io.github.viktorhso.tarefas.usuario.Usuario;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/** Gera os tokens JWT. O "subject" do token é o id do usuário. */
@Service
public class TokenService {

    static final String EMISSOR = "api-tarefas";

    private final JwtEncoder encoder;
    private final JwtProperties propriedades;
    private final Clock relogio;

    public TokenService(JwtEncoder encoder, JwtProperties propriedades, Clock relogio) {
        this.encoder = encoder;
        this.propriedades = propriedades;
        this.relogio = relogio;
    }

    public TokenResponse gerar(Usuario usuario) {
        Instant agora = relogio.instant();
        Instant expiraEm = agora.plus(Duration.ofMinutes(propriedades.expiracaoMinutos()));
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(EMISSOR)
                .subject(usuario.getId().toString())
                .claim("nome", usuario.getNome())
                .issuedAt(agora)
                .expiresAt(expiraEm)
                .build();
        JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(cabecalho, claims)).getTokenValue();
        return new TokenResponse(token, "Bearer", expiraEm);
    }
}
