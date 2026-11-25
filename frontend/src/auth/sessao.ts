/**
 * Sessão do usuário guardada no sessionStorage: some ao fechar a aba
 * e é descartada assim que o token expira.
 */
const CHAVE = 'tarefas.sessao'

export type Sessao = {
  token: string
  nome: string
  expiraEm: string
}

export function salvarSessao(token: string, expiraEm: string): Sessao {
  const sessao: Sessao = { token, expiraEm, nome: nomeDoToken(token) }
  sessionStorage.setItem(CHAVE, JSON.stringify(sessao))
  return sessao
}

export function lerSessao(): Sessao | null {
  const bruto = sessionStorage.getItem(CHAVE)
  if (!bruto) return null
  try {
    const sessao = JSON.parse(bruto) as Sessao
    if (!sessao.token || new Date(sessao.expiraEm).getTime() <= Date.now()) {
      apagarSessao()
      return null
    }
    return sessao
  } catch {
    apagarSessao()
    return null
  }
}

export function apagarSessao() {
  sessionStorage.removeItem(CHAVE)
}

/** Lê o nome que a API coloca no token. Só para exibir: quem valida o token é a API. */
function nomeDoToken(token: string): string {
  try {
    const conteudo = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      Array.from(atob(conteudo), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    )
    return (JSON.parse(json).nome as string) ?? ''
  } catch {
    return ''
  }
}
