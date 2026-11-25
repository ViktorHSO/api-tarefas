package io.github.viktorhso.tarefas.auth;

import java.util.Locale;

import io.github.viktorhso.tarefas.auth.AuthDtos.LoginRequest;
import io.github.viktorhso.tarefas.auth.AuthDtos.RegistroRequest;
import io.github.viktorhso.tarefas.auth.AuthDtos.TokenResponse;
import io.github.viktorhso.tarefas.auth.AuthDtos.UsuarioResponse;
import io.github.viktorhso.tarefas.erro.CredenciaisInvalidasException;
import io.github.viktorhso.tarefas.erro.EmailJaCadastradoException;
import io.github.viktorhso.tarefas.usuario.Usuario;
import io.github.viktorhso.tarefas.usuario.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public UsuarioResponse registrar(RegistroRequest dados) {
        String email = normalizar(dados.email());
        if (usuarios.existsByEmail(email)) {
            throw new EmailJaCadastradoException();
        }
        Usuario usuario = usuarios.save(
                new Usuario(dados.nome().trim(), email, passwordEncoder.encode(dados.senha())));
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest dados) {
        Usuario usuario = usuarios.findByEmail(normalizar(dados.email()))
                .filter(u -> passwordEncoder.matches(dados.senha(), u.getSenhaHash()))
                .orElseThrow(CredenciaisInvalidasException::new);
        return tokenService.gerar(usuario);
    }

    private static String normalizar(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
