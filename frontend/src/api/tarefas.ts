import type { Prioridade, Status } from '../componentes/Bib'
import { requisicao } from './cliente'

export type Tarefa = {
  id: number
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  status: Status
  prazo: string | null
  atrasada: boolean
  criadaEm: string
  atualizadaEm: string
  concluidaEm: string | null
}

export type Pagina<T> = {
  itens: T[]
  pagina: number
  tamanho: number
  totalItens: number
  totalPaginas: number
}

export type Filtros = {
  status?: Status
  prioridade?: Prioridade
  atrasadas?: boolean
  busca?: string
}

export type DadosTarefa = {
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  prazo: string | null
}

export const TAMANHO_PAGINA = 12

export function listarTarefas(filtros: Filtros, pagina: number) {
  const parametros = new URLSearchParams({ page: String(pagina), size: String(TAMANHO_PAGINA) })
  if (filtros.status) parametros.set('status', filtros.status)
  if (filtros.prioridade) parametros.set('prioridade', filtros.prioridade)
  if (filtros.atrasadas) parametros.set('atrasadas', 'true')
  if (filtros.busca?.trim()) parametros.set('busca', filtros.busca.trim())
  return requisicao<Pagina<Tarefa>>(`/tarefas?${parametros}`)
}

export function criarTarefa(dados: DadosTarefa) {
  return requisicao<Tarefa>('/tarefas', { metodo: 'POST', corpo: dados })
}

export function atualizarTarefa(id: number, dados: DadosTarefa) {
  return requisicao<Tarefa>(`/tarefas/${id}`, { metodo: 'PUT', corpo: dados })
}

export function alterarStatus(id: number, status: Status) {
  return requisicao<Tarefa>(`/tarefas/${id}/status`, { metodo: 'PATCH', corpo: { status } })
}

export function excluirTarefa(id: number) {
  return requisicao<void>(`/tarefas/${id}`, { metodo: 'DELETE' })
}
