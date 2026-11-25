package io.github.viktorhso.tarefas.tarefa;

import io.github.viktorhso.tarefas.tarefa.TarefaDtos.PaginaResponse;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.ResumoResponse;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.StatusRequest;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.TarefaRequest;
import io.github.viktorhso.tarefas.tarefa.TarefaDtos.TarefaResponse;
import io.github.viktorhso.tarefas.tarefa.TarefaService.Filtro;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tarefas")
@Tag(name = "Tarefas")
@SecurityRequirement(name = "bearer-jwt")
public class TarefaController {

    private final TarefaService service;

    public TarefaController(TarefaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lista as tarefas do usuário, com filtros, busca e paginação")
    public PaginaResponse<TarefaResponse> listar(
            @AuthenticationPrincipal Jwt token,
            @RequestParam(required = false) StatusTarefa status,
            @RequestParam(required = false) Prioridade prioridade,
            @RequestParam(required = false) Boolean atrasadas,
            @RequestParam(required = false) String busca,
            @ParameterObject @PageableDefault(size = 10, sort = "criadaEm", direction = Sort.Direction.DESC)
            Pageable paginacao) {
        return service.listar(usuarioId(token), new Filtro(status, prioridade, atrasadas, busca), paginacao);
    }

    @GetMapping("/resumo")
    @Operation(summary = "Quantidade de tarefas por status e quantas estão atrasadas")
    public ResumoResponse resumo(@AuthenticationPrincipal Jwt token) {
        return service.resumo(usuarioId(token));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma tarefa")
    public TarefaResponse buscar(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        return service.buscar(usuarioId(token), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria uma tarefa (começa como PENDENTE)")
    public TarefaResponse criar(@AuthenticationPrincipal Jwt token, @Valid @RequestBody TarefaRequest dados) {
        return service.criar(usuarioId(token), dados);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza título, descrição, prioridade e prazo")
    public TarefaResponse atualizar(@AuthenticationPrincipal Jwt token, @PathVariable Long id,
            @Valid @RequestBody TarefaRequest dados) {
        return service.atualizar(usuarioId(token), id, dados);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Muda o status da tarefa")
    public TarefaResponse alterarStatus(@AuthenticationPrincipal Jwt token, @PathVariable Long id,
            @Valid @RequestBody StatusRequest dados) {
        return service.alterarStatus(usuarioId(token), id, dados.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui uma tarefa")
    public void excluir(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        service.excluir(usuarioId(token), id);
    }

    private static Long usuarioId(Jwt token) {
        return Long.valueOf(token.getSubject());
    }
}
