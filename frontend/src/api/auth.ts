import { requisicao } from './cliente'

export type DadosCadastro = { nome: string; email: string; senha: string }
export type DadosLogin = { email: string; senha: string }
export type RespostaLogin = { accessToken: string; tipo: string; expiraEm: string }

export function cadastrar(dados: DadosCadastro) {
  return requisicao<{ id: number; nome: string; email: string }>('/auth/registro', {
    metodo: 'POST',
    corpo: dados,
    autenticada: false,
  })
}

export function login(dados: DadosLogin) {
  return requisicao<RespostaLogin>('/auth/login', { metodo: 'POST', corpo: dados, autenticada: false })
}
