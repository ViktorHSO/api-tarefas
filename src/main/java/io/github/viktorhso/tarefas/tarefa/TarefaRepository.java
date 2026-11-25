package io.github.viktorhso.tarefas.tarefa;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TarefaRepository extends JpaRepository<Tarefa, Long>, JpaSpecificationExecutor<Tarefa> {

    /** Busca sempre pelo id E pelo dono: um usuário nunca acessa tarefa de outro. */
    Optional<Tarefa> findByIdAndUsuarioId(Long id, Long usuarioId);

    long countByUsuarioIdAndStatus(Long usuarioId, StatusTarefa status);

    long countByUsuarioIdAndStatusNotAndPrazoBefore(Long usuarioId, StatusTarefa status, LocalDate data);
}
