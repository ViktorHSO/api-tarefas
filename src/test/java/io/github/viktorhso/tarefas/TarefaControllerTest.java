package io.github.viktorhso.tarefas;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.ZoneId;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.MediaType;

class TarefaControllerTest extends TesteDeApi {

    private String token;

    @BeforeEach
    void criarConta() throws Exception {
        token = contaComToken("dono@exemplo.com");
    }

    @Test
    void criaUmaTarefaPendente() throws Exception {
        mvc.perform(post("/tarefas").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("titulo", "  Estudar Spring  ", "descricao", "Capítulo de segurança",
                                "prioridade", "ALTA", "prazo", hoje().plusDays(3))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(notNullValue()))
                .andExpect(jsonPath("$.titulo").value("Estudar Spring"))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.prioridade").value("ALTA"))
                .andExpect(jsonPath("$.atrasada").value(false))
                .andExpect(jsonPath("$.concluidaEm").value(nullValue()));
    }

    @Test
    void validaOsCamposDaTarefa() throws Exception {
        mvc.perform(post("/tarefas").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("titulo", " ", "prioridade", null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.titulo").exists())
                .andExpect(jsonPath("$.erros.prioridade").exists());
    }

    @Test
    void recusaPrioridadeInexistente() throws Exception {
        mvc.perform(post("/tarefas").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("titulo", "Teste", "prioridade", "URGENTISSIMA")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listaComFiltrosEBusca() throws Exception {
        criarTarefa("Comprar pão", "BAIXA", null);
        criarTarefa("Entregar trabalho", "ALTA", null);
        criarTarefa("Revisar trabalho", "MEDIA", null);

        mvc.perform(get("/tarefas").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(3)))
                .andExpect(jsonPath("$.totalItens").value(3));

        mvc.perform(get("/tarefas").param("prioridade", "ALTA").header("Authorization", token))
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].titulo").value("Entregar trabalho"));

        mvc.perform(get("/tarefas").param("busca", "TRABALHO").header("Authorization", token))
                .andExpect(jsonPath("$.itens", hasSize(2)));
    }

    @Test
    void buscaTrataPorcentagemComoTextoComum() throws Exception {
        criarTarefa("Meta de 100% do curso", "MEDIA", null);
        criarTarefa("Outra tarefa", "MEDIA", null);

        mvc.perform(get("/tarefas").param("busca", "%").header("Authorization", token))
                .andExpect(jsonPath("$.itens", hasSize(1)));
    }

    @Test
    void paginaOsResultados() throws Exception {
        for (int i = 1; i <= 5; i++) {
            criarTarefa("Tarefa " + i, "BAIXA", null);
        }

        mvc.perform(get("/tarefas").param("size", "2").param("page", "1").header("Authorization", token))
                .andExpect(jsonPath("$.itens", hasSize(2)))
                .andExpect(jsonPath("$.pagina").value(1))
                .andExpect(jsonPath("$.totalItens").value(5))
                .andExpect(jsonPath("$.totalPaginas").value(3));
    }

    @Test
    void ordenacaoPorCampoInexistenteDa400() throws Exception {
        mvc.perform(get("/tarefas").param("sort", "campoQueNaoExiste").header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void concluirGuardaADataEReabrirLimpa() throws Exception {
        long id = criarTarefa("Lavar a louça", "BAIXA", null);

        mvc.perform(patch("/tarefas/{id}/status", id).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("status", "CONCLUIDA")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andExpect(jsonPath("$.concluidaEm").value(notNullValue()));

        mvc.perform(patch("/tarefas/{id}/status", id).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("status", "EM_ANDAMENTO")))
                .andExpect(jsonPath("$.status").value("EM_ANDAMENTO"))
                .andExpect(jsonPath("$.concluidaEm").value(nullValue()));
    }

    @Test
    void tarefaComPrazoVencidoFicaAtrasadaAteSerConcluida() throws Exception {
        long id = criarTarefa("Pagar conta", "ALTA", hoje().minusDays(2));
        criarTarefa("Sem prazo", "BAIXA", null);

        mvc.perform(get("/tarefas").param("atrasadas", "true").header("Authorization", token))
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].atrasada").value(true));

        mvc.perform(patch("/tarefas/{id}/status", id).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("status", "CONCLUIDA")))
                .andExpect(jsonPath("$.atrasada").value(false));

        mvc.perform(get("/tarefas").param("atrasadas", "true").header("Authorization", token))
                .andExpect(jsonPath("$.itens", hasSize(0)));
    }

    @Test
    void atualizaEExclui() throws Exception {
        long id = criarTarefa("Rascunho", "BAIXA", null);

        mvc.perform(put("/tarefas/{id}", id).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("titulo", "Versão final", "prioridade", "MEDIA")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Versão final"))
                .andExpect(jsonPath("$.prioridade").value("MEDIA"));

        mvc.perform(delete("/tarefas/{id}", id).header("Authorization", token))
                .andExpect(status().isNoContent());

        mvc.perform(get("/tarefas/{id}", id).header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    void usuarioNaoVeNemAlteraTarefaDeOutro() throws Exception {
        long id = criarTarefa("Tarefa secreta", "ALTA", null);
        String outro = contaComToken("intruso@exemplo.com");

        mvc.perform(get("/tarefas/{id}", id).header("Authorization", outro))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/tarefas/{id}", id).header("Authorization", outro))
                .andExpect(status().isNotFound());
        mvc.perform(get("/tarefas").header("Authorization", outro))
                .andExpect(jsonPath("$.itens", hasSize(0)));

        mvc.perform(get("/tarefas/{id}", id).header("Authorization", token))
                .andExpect(status().isOk());
    }

    @Test
    void resumoContaPorStatusEAtrasadas() throws Exception {
        criarTarefa("A", "BAIXA", null);
        long emAndamento = criarTarefa("B", "MEDIA", hoje().minusDays(1));
        long concluida = criarTarefa("C", "ALTA", hoje().minusDays(1));
        alterarStatus(emAndamento, "EM_ANDAMENTO");
        alterarStatus(concluida, "CONCLUIDA");

        mvc.perform(get("/tarefas/resumo").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.pendentes").value(1))
                .andExpect(jsonPath("$.emAndamento").value(1))
                .andExpect(jsonPath("$.concluidas").value(1))
                .andExpect(jsonPath("$.atrasadas").value(1));
    }

    /** "Hoje" no mesmo fuso que a API usa (app.fuso-horario), para os testes não dependerem do fuso do servidor. */
    private static LocalDate hoje() {
        return LocalDate.now(ZoneId.of("America/Sao_Paulo"));
    }

    private long criarTarefa(String titulo, String prioridade, LocalDate prazo) throws Exception {
        String resposta = mvc.perform(post("/tarefas").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("titulo", titulo, "prioridade", prioridade, "prazo", prazo)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(resposta, "$.id");
        return id.longValue();
    }

    private void alterarStatus(long id, String status) throws Exception {
        mvc.perform(patch("/tarefas/{id}/status", id).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("status", status)))
                .andExpect(status().isOk());
    }
}
