package io.github.viktorhso.tarefas.tarefa;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import io.github.viktorhso.tarefas.erro.RecursoNaoEncontradoException;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.PaginaResponse;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.ResumoResponse;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.TarefaRequest;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.TarefaResponse;
import io.github.viktorhso.tarefas.usuario.UsuarioRepository;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TarefaService {

    private final TarefaRepository tarefas;
    private final UsuarioRepository usuarios;
    private final Clock relogio;

    public TarefaService(TarefaRepository tarefas, UsuarioRepository usuarios, Clock relogio) {
        this.tarefas = tarefas;
        this.usuarios = usuarios;
        this.relogio = relogio;
    }

    /** Filtros opcionais da listagem. Campos nulos não filtram. */
    public record Filtro(StatusTarefa status, Prioridade prioridade, Boolean atrasadas, String busca) {
    }

    @Transactional(readOnly = true)
    public PaginaResponse<TarefaResponse> listar(Long usuarioId, Filtro filtro, Pageable paginacao) {
        LocalDate hoje = hoje();
        Specification<Tarefa> consulta = especificacao(usuarioId, filtro, hoje);
        return PaginaResponse.de(tarefas.findAll(consulta, paginacao), t -> TarefaResponse.de(t, hoje));
    }

    @Transactional(readOnly = true)
    public TarefaResponse buscar(Long usuarioId, Long id) {
        return TarefaResponse.de(daUsuario(usuarioId, id), hoje());
    }

    @Transactional
    public TarefaResponse criar(Long usuarioId, TarefaRequest dados) {
        Tarefa tarefa = new Tarefa(usuarios.getReferenceById(usuarioId), dados.titulo().trim(),
                textoOuNulo(dados.descricao()), dados.prioridade(), dados.prazo());
        return TarefaResponse.de(tarefas.save(tarefa), hoje());
    }

    @Transactional
    public TarefaResponse atualizar(Long usuarioId, Long id, TarefaRequest dados) {
        Tarefa tarefa = daUsuario(usuarioId, id);
        tarefa.atualizar(dados.titulo().trim(), textoOuNulo(dados.descricao()), dados.prioridade(), dados.prazo());
        return TarefaResponse.de(tarefas.saveAndFlush(tarefa), hoje());
    }

    @Transactional
    public TarefaResponse alterarStatus(Long usuarioId, Long id, StatusTarefa status) {
        Tarefa tarefa = daUsuario(usuarioId, id);
        tarefa.alterarStatus(status, LocalDateTime.now(relogio));
        return TarefaResponse.de(tarefas.saveAndFlush(tarefa), hoje());
    }

    @Transactional
    public void excluir(Long usuarioId, Long id) {
        tarefas.delete(daUsuario(usuarioId, id));
    }

    @Transactional(readOnly = true)
    public ResumoResponse resumo(Long usuarioId) {
        long pendentes = tarefas.countByUsuarioIdAndStatus(usuarioId, StatusTarefa.PENDENTE);
        long emAndamento = tarefas.countByUsuarioIdAndStatus(usuarioId, StatusTarefa.EM_ANDAMENTO);
        long concluidas = tarefas.countByUsuarioIdAndStatus(usuarioId, StatusTarefa.CONCLUIDA);
        long atrasadas = tarefas.countByUsuarioIdAndStatusNotAndPrazoBefore(usuarioId, StatusTarefa.CONCLUIDA, hoje());
        return new ResumoResponse(pendentes + emAndamento + concluidas, pendentes, emAndamento, concluidas, atrasadas);
    }

    private Tarefa daUsuario(Long usuarioId, Long id) {
        // Tarefa de outro usuário responde 404, como se não existisse: não revela ids alheios.
        return tarefas.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tarefa " + id + " não encontrada."));
    }

    private LocalDate hoje() {
        return LocalDate.now(relogio);
    }

    private static String textoOuNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private static Specification<Tarefa> especificacao(Long usuarioId, Filtro filtro, LocalDate hoje) {
        return (raiz, consulta, cb) -> {
            List<Predicate> condicoes = new ArrayList<>();
            condicoes.add(cb.equal(raiz.get("usuario").get("id"), usuarioId));
            if (filtro.status() != null) {
                condicoes.add(cb.equal(raiz.get("status"), filtro.status()));
            }
            if (filtro.prioridade() != null) {
                condicoes.add(cb.equal(raiz.get("prioridade"), filtro.prioridade()));
            }
            if (Boolean.TRUE.equals(filtro.atrasadas())) {
                condicoes.add(cb.lessThan(raiz.<LocalDate>get("prazo"), hoje));
                condicoes.add(cb.notEqual(raiz.get("status"), StatusTarefa.CONCLUIDA));
            }
            if (filtro.busca() != null && !filtro.busca().isBlank()) {
                String termo = "%" + escaparCuringas(filtro.busca().trim().toLowerCase(Locale.ROOT)) + "%";
                condicoes.add(cb.like(cb.lower(raiz.<String>get("titulo")), termo, '\\'));
            }
            return cb.and(condicoes.toArray(Predicate[]::new));
        };
    }

    /** Impede que % e _ digitados na busca funcionem como curingas do LIKE. */
    private static String escaparCuringas(String texto) {
        return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
