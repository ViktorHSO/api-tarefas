import { lerSessao } from '../auth/sessao'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

/** Evento disparado quando a API recusa o token (expirado ou inválido). */
export const EVENTO_SESSAO_EXPIRADA = 'sessao-expirada'

/** Erro devolvido pela API no formato Problem Details. */
export class ErroApi extends Error {
  readonly status: number
  readonly titulo: string
  readonly erros: Record<string, string>

  constructor(status: number, titulo: string, detalhe: string, erros: Record<string, string> = {}) {
    super(detalhe)
    this.name = 'ErroApi'
    this.status = status
    this.titulo = titulo
    this.erros = erros
  }
}

type Opcoes = {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  corpo?: unknown
  autenticada?: boolean
}

export async function requisicao<T>(caminho: string, { metodo = 'GET', corpo, autenticada = true }: Opcoes = {}): Promise<T> {
  const cabecalhos: Record<string, string> = { Accept: 'application/json' }
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'

  const sessao = autenticada ? lerSessao() : null
  if (sessao) cabecalhos.Authorization = `Bearer ${sessao.token}`

  let resposta: Response
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    })
  } catch {
    throw new ErroApi(0, 'Sem conexão', 'Não foi possível falar com o servidor. Confira sua internet e tente de novo.')
  }

  if (resposta.status === 401 && sessao) {
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA))
  }

  if (!resposta.ok) {
    const problema = await resposta.json().catch(() => ({}))
    throw new ErroApi(
      resposta.status,
      problema.title ?? 'Erro',
      problema.detail ?? 'Algo deu errado no servidor. Tente de novo em instantes.',
      problema.erros ?? {},
    )
  }

  if (resposta.status === 204) return undefined as T
  return resposta.json() as Promise<T>
}
