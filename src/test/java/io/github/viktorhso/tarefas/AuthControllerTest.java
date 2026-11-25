package io.github.viktorhso.tarefas;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

import org.springframework.http.MediaType;

class AuthControllerTest extends TesteDeApi {

    @Test
    void registraUmaContaSemDevolverASenha() throws Exception {
        mvc.perform(post("/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("nome", "Ana", "email", "Ana@Exemplo.com", "senha", SENHA)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(notNullValue()))
                .andExpect(jsonPath("$.email").value("ana@exemplo.com"))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.senhaHash").doesNotExist());
    }

    @Test
    void recusaEmailRepetidoMesmoComMaiusculas() throws Exception {
        registrar("Ana", "ana@exemplo.com");

        mvc.perform(post("/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("nome", "Outra Ana", "email", "ANA@exemplo.com", "senha", SENHA)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("E-mail já cadastrado"));
    }

    @Test
    void validaOsCamposDoCadastro() throws Exception {
        mvc.perform(post("/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("nome", "", "email", "nao-e-email", "senha", "123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.nome").exists())
                .andExpect(jsonPath("$.erros.email").exists())
                .andExpect(jsonPath("$.erros.senha").exists());
    }

    @Test
    void loginDevolveUmToken() throws Exception {
        registrar("Bruno", "bruno@exemplo.com");

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", "bruno@exemplo.com", "senha", SENHA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(notNullValue()))
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.expiraEm").value(notNullValue()));
    }

    @Test
    void loginComSenhaErradaOuEmailInexistenteDaAMesmaResposta() throws Exception {
        registrar("Carla", "carla@exemplo.com");

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", "carla@exemplo.com", "senha", "senha-errada")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos."));

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", "ninguem@exemplo.com", "senha", SENHA)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos."));
    }

    @Test
    void rotasProtegidasExigemToken() throws Exception {
        mvc.perform(get("/tarefas")).andExpect(status().isUnauthorized());
        mvc.perform(get("/tarefas").header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void documentacaoEHealthSaoPublicos() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }
}
