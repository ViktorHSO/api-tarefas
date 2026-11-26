import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Status } from '../componentes/Bib'
import {
  alterarStatus,
  atualizarTarefa,
  buscarResumo,
  criarTarefa,
  excluirTarefa,
  listarAtrasadas,
  listarTarefas,
  type DadosTarefa,
  type FiltroTarefas,
} from './tarefas'

/** Tudo que depende das tarefas fica embaixo desta chave, para invalidar de uma vez. */
const CHAVE = ['tarefas'] as const

export function useTarefas(filtro: FiltroTarefas) {
  return useQuery({
    queryKey: [...CHAVE, 'lista', filtro],
    queryFn: () => listarTarefas(filtro),
    // Mantém a página atual na tela enquanto a próxima carrega (sem "piscar" vazio).
    placeholderData: keepPreviousData,
  })
}

export function useResumo() {
  return useQuery({ queryKey: [...CHAVE, 'resumo'], queryFn: buscarResumo })
}

export function useAtrasadas(quantidade: number) {
  return useQuery({ queryKey: [...CHAVE, 'atrasadas', quantidade], queryFn: () => listarAtrasadas(quantidade) })
}

/** Qualquer alteração muda a lista e o resumo, então recarrega os dois. */
function useAlteracao<V, R>(funcao: (variaveis: V) => Promise<R>) {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: funcao,
    onSuccess: () => cliente.invalidateQueries({ queryKey: CHAVE }),
  })
}

export function useSalvarTarefa() {
  return useAlteracao(({ id, dados }: { id?: number; dados: DadosTarefa }) =>
    id === undefined ? criarTarefa(dados) : atualizarTarefa(id, dados),
  )
}

export function useAlterarStatus() {
  return useAlteracao(({ id, status }: { id: number; status: Status }) => alterarStatus(id, status))
}

export function useExcluirTarefa() {
  return useAlteracao((id: number) => excluirTarefa(id))
}
