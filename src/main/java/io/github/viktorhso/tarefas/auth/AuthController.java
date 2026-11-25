package io.github.viktorhso.tarefas.auth;

import io.github.viktorhso.tarefas.auth.AuthDtos.LoginRequest;
import io.github.viktorhso.tarefas.auth.AuthDtos.RegistroRequest;
import io.github.viktorhso.tarefas.auth.AuthDtos.TokenResponse;
import io.github.viktorhso.tarefas.auth.AuthDtos.UsuarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria uma conta")
    public UsuarioResponse registrar(@Valid @RequestBody RegistroRequest dados) {
        return authService.registrar(dados);
    }

    @PostMapping("/login")
    @Operation(summary = "Faz login e devolve o token JWT")
    public TokenResponse login(@Valid @RequestBody LoginRequest dados) {
        return authService.login(dados);
    }
}
