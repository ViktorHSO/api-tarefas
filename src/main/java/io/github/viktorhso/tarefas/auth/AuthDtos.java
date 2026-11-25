package io.github.viktorhso.tarefas.auth;

import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Objetos de entrada e saída das rotas de autenticação. */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegistroRequest(
            @NotBlank(message = "Informe o nome.")
            @Size(max = 100, message = "O nome pode ter no máximo 100 caracteres.")
            String nome,

            @NotBlank(message = "Informe o e-mail.")
            @Email(message = "E-mail inválido.")
            @Size(max = 255, message = "O e-mail pode ter no máximo 255 caracteres.")
            String email,

            @NotBlank(message = "Informe a senha.")
            @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
            String senha) {
    }

    public record LoginRequest(
            @NotBlank(message = "Informe o e-mail.") String email,
            @NotBlank(message = "Informe a senha.") String senha) {
    }

    public record UsuarioResponse(Long id, String nome, String email) {
    }

    public record TokenResponse(String accessToken, String tipo, Instant expiraEm) {
    }
}
