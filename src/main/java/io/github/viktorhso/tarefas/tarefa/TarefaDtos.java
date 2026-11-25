package io.github.viktorhso.tarefas.tarefa;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.data.domain.Page;

/** Objetos de entrada e saída das rotas de tarefas. */
public final class TarefaDtos {

    private TarefaDtos() {
    }

    public record TarefaRequest(
            @NotBlank(message = "Informe o título.")
            @Size(max = 120, message = "O título pode ter no máximo 120 caracteres.")
            String titulo,

            @Size(max = 2000, message = "A descrição pode ter no máximo 2000 caracteres.")
            String descricao,

            @NotNull(message = "Informe a prioridade: BAIXA, MEDIA ou ALTA.")
            Prioridade prioridade,

            LocalDate prazo) {
    }

    public record StatusRequest(
            @NotNull(message = "Informe o status: PENDENTE, EM_ANDAMENTO ou CONCLUIDA.")
            StatusTarefa status) {
    }

    public record TarefaResponse(
            Long id,
            String titulo,
            String descricao,
            Prioridade prioridade,
            StatusTarefa status,
            LocalDate prazo,
            boolean atrasada,
            LocalDateTime criadaEm,
            LocalDateTime atualizadaEm,
            LocalDateTime concluidaEm) {

        static TarefaResponse de(Tarefa t, LocalDate hoje) {
            return new TarefaResponse(t.getId(), t.getTitulo(), t.getDescricao(), t.getPrioridade(),
                    t.getStatus(), t.getPrazo(), t.estaAtrasada(hoje), t.getCriadaEm(), t.getAtualizadaEm(),
                    t.getConcluidaEm());
        }
    }

    public record ResumoResponse(long total, long pendentes, long emAndamento, long concluidas, long atrasadas) {
    }

    /** Página de resultados num formato estável (o JSON do Page do Spring pode mudar entre versões). */
    public record PaginaResponse<T>(List<T> itens, int pagina, int tamanho, long totalItens, int totalPaginas) {

        static <E, T> PaginaResponse<T> de(Page<E> pagina, Function<E, T> conversor) {
            return new PaginaResponse<>(pagina.getContent().stream().map(conversor).toList(), pagina.getNumber(),
                    pagina.getSize(), pagina.getTotalElements(), pagina.getTotalPages());
        }
    }
}
