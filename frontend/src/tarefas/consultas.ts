import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  alterarStatus,
  atualizarTarefa,
  criarTarefa,
  excluirTarefa,
  listarTarefas,
  type DadosTarefa,
  type Filtros,
} from '../api/tarefas'
import type { Status } from '../componentes/Bib'

/** Tudo que depende da lista de tarefas usa esta chave; mudar uma tarefa atualiza tudo de uma vez. */
export const CHAVE_TAREFAS = ['tarefas'] as const

export function useListaTarefas(filtros: Filtros, pagina: number) {
  return useQuery({
    queryKey: [...CHAVE_TAREFAS, 'lista', filtros, pagina],
    queryFn: () => listarTarefas(filtros, pagina),
    // Enquanto a próxima página ou filtro carrega, mantém a anterior na tela.
    placeholderData: keepPreviousData,
  })
}

function useAoMudarTarefas() {
  const cliente = useQueryClient()
  return () => cliente.invalidateQueries({ queryKey: CHAVE_TAREFAS })
}

export function useSalvarTarefa() {
  const aoMudar = useAoMudarTarefas()
  return useMutation({
    mutationFn: ({ id, dados }: { id?: number; dados: DadosTarefa }) => (id ? atualizarTarefa(id, dados) : criarTarefa(dados)),
    onSuccess: aoMudar,
  })
}

export function useAlterarStatus() {
  const aoMudar = useAoMudarTarefas()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) => alterarStatus(id, status),
    onSuccess: aoMudar,
  })
}

export function useExcluirTarefa() {
  const aoMudar = useAoMudarTarefas()
  return useMutation({
    mutationFn: (id: number) => excluirTarefa(id),
    onSuccess: aoMudar,
  })
}
