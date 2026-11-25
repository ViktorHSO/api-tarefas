package io.github.viktorhso.tarefas;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base dos testes de integração: sobe a aplicação inteira com H2 em memória.
 * Cada teste roda numa transação desfeita no final, então um não interfere no outro.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public abstract class TesteDeApi {

    protected static final String SENHA = "senha-de-teste";

    @Autowired
    protected MockMvc mvc;

    protected void registrar(String nome, String email) throws Exception {
        mvc.perform(post("/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("nome", nome, "email", email, "senha", SENHA)))
                .andExpect(status().isCreated());
    }

    /** Cria a conta, faz login e devolve o cabeçalho Authorization pronto. */
    protected String contaComToken(String email) throws Exception {
        registrar("Pessoa de Teste", email);
        String resposta = mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "senha", SENHA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(resposta, "$.accessToken");
        return "Bearer " + token;
    }

    /** Monta um JSON simples a partir de pares chave/valor. Valores null viram null no JSON. */
    protected static String json(Object... chavesEValores) {
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < chavesEValores.length; i += 2) {
            if (i > 0) {
                sb.append(',');
            }
            Object valor = chavesEValores[i + 1];
            sb.append('"').append(chavesEValores[i]).append("\":");
            sb.append(valor == null ? "null" : "\"" + valor.toString().replace("\"", "\\\"") + "\"");
        }
        return sb.append('}').toString();
    }
}
