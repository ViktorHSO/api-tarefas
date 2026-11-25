package io.github.viktorhso.tarefas.tarefa;

import java.time.LocalDate;
import java.time.LocalDateTime;

import io.github.viktorhso.tarefas.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "tarefas")
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(length = 2000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Prioridade prioridade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private StatusTarefa status;

    private LocalDate prazo;

    @Column(name = "criada_em", nullable = false)
    private LocalDateTime criadaEm;

    @Column(name = "atualizada_em", nullable = false)
    private LocalDateTime atualizadaEm;

    @Column(name = "concluida_em")
    private LocalDateTime concluidaEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    protected Tarefa() {
    }

    public Tarefa(Usuario usuario, String titulo, String descricao, Prioridade prioridade, LocalDate prazo) {
        this.usuario = usuario;
        this.status = StatusTarefa.PENDENTE;
        atualizar(titulo, descricao, prioridade, prazo);
    }

    public void atualizar(String titulo, String descricao, Prioridade prioridade, LocalDate prazo) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazo = prazo;
    }

    /** Muda o status. Ao concluir, guarda quando; ao reabrir, limpa a data de conclusão. */
    public void alterarStatus(StatusTarefa novoStatus, LocalDateTime agora) {
        if (novoStatus == status) {
            return;
        }
        this.status = novoStatus;
        this.concluidaEm = novoStatus == StatusTarefa.CONCLUIDA ? agora : null;
    }

    /** Atrasada: tem prazo, o prazo já passou e ainda não foi concluída. */
    public boolean estaAtrasada(LocalDate hoje) {
        return prazo != null && prazo.isBefore(hoje) && status != StatusTarefa.CONCLUIDA;
    }

    @PrePersist
    void aoCriar() {
        criadaEm = LocalDateTime.now();
        atualizadaEm = criadaEm;
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadaEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Prioridade getPrioridade() {
        return prioridade;
    }

    public StatusTarefa getStatus() {
        return status;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public LocalDateTime getAtualizadaEm() {
        return atualizadaEm;
    }

    public LocalDateTime getConcluidaEm() {
        return concluidaEm;
    }

    public Usuario getUsuario() {
        return usuario;
    }
}
