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

export type DadosTarefa = {
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  prazo: string | null
}

export type Pagina<T> = {
  itens: T[]
  pagina: number
  tamanho: number
  totalItens: number
  totalPaginas: number
}

export type Resumo = {
  total: number
  pendentes: number
  emAndamento: number
  concluidas: number
  atrasadas: number
}

export type Ordem = 'recentes' | 'prazo' | 'titulo'

export type FiltroTarefas = {
  status?: Status
  prioridade?: Prioridade
  atrasadas?: boolean
  busca?: string
  ordem?: Ordem
  pagina?: number
}

export const TAMANHO_PAGINA = 12

/** Cada opção de ordenação vira o parâmetro `sort` que o Spring entende. */
const SORT: Record<Ordem, string> = {
  recentes: 'criadaEm,desc',
  prazo: 'prazo,asc',
  titulo: 'titulo,asc',
}

export function parametrosDaLista(filtro: FiltroTarefas): string {
  const params = new URLSearchParams()
  if (filtro.status) params.set('status', filtro.status)
  if (filtro.prioridade) params.set('prioridade', filtro.prioridade)
  if (filtro.atrasadas) params.set('atrasadas', 'true')
  if (filtro.busca?.trim()) params.set('busca', filtro.busca.trim())
  params.set('page', String(filtro.pagina ?? 0))
  params.set('size', String(TAMANHO_PAGINA))
  params.set('sort', SORT[filtro.ordem ?? 'recentes'])
  // Desempate estável: sem ele, tarefas com o mesmo prazo podem trocar de página.
  params.append('sort', 'id,desc')
  return params.toString()
}

export function listarTarefas(filtro: FiltroTarefas) {
  return requisicao<Pagina<Tarefa>>(`/tarefas?${parametrosDaLista(filtro)}`)
}

/** As atrasadas com o prazo mais antigo primeiro: são as que mais pedem atenção. */
export function listarAtrasadas(quantidade: number) {
  const params = new URLSearchParams({ atrasadas: 'true', page: '0', size: String(quantidade) })
  params.append('sort', 'prazo,asc')
  params.append('sort', 'id,asc')
  return requisicao<Pagina<Tarefa>>(`/tarefas?${params}`)
}

export function buscarResumo() {
  return requisicao<Resumo>('/tarefas/resumo')
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
