package io.github.viktorhso.tarefas.tarefa;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

/** Testes de unidade das regras da entidade, sem subir o Spring. */
class TarefaTest {

    private static final LocalDate HOJE = LocalDate.of(2026, 11, 24);

    @Test
    void semPrazoNuncaFicaAtrasada() {
        assertThat(tarefa(null).estaAtrasada(HOJE)).isFalse();
    }

    @Test
    void prazoHojeAindaNaoEstaAtrasado() {
        assertThat(tarefa(HOJE).estaAtrasada(HOJE)).isFalse();
    }

    @Test
    void prazoOntemEstaAtrasado() {
        assertThat(tarefa(HOJE.minusDays(1)).estaAtrasada(HOJE)).isTrue();
    }

    @Test
    void tarefaConcluidaNaoFicaAtrasada() {
        Tarefa tarefa = tarefa(HOJE.minusDays(10));
        tarefa.alterarStatus(StatusTarefa.CONCLUIDA, LocalDateTime.of(2026, 11, 20, 10, 0));

        assertThat(tarefa.estaAtrasada(HOJE)).isFalse();
        assertThat(tarefa.getConcluidaEm()).isEqualTo(LocalDateTime.of(2026, 11, 20, 10, 0));
    }

    @Test
    void mudarParaOMesmoStatusNaoMexeNaDataDeConclusao() {
        Tarefa tarefa = tarefa(null);
        LocalDateTime primeiraConclusao = LocalDateTime.of(2026, 11, 20, 10, 0);
        tarefa.alterarStatus(StatusTarefa.CONCLUIDA, primeiraConclusao);
        tarefa.alterarStatus(StatusTarefa.CONCLUIDA, primeiraConclusao.plusDays(1));

        assertThat(tarefa.getConcluidaEm()).isEqualTo(primeiraConclusao);
    }

    private static Tarefa tarefa(LocalDate prazo) {
        return new Tarefa(null, "Tarefa", null, Prioridade.MEDIA, prazo);
    }
}
