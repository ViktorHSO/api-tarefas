import { createContext, useContext } from 'react'
import type { DadosLogin } from '../api/auth'
import type { Sessao } from './sessao'

export type ValorAuth = {
  sessao: Sessao | null
  entrar: (dados: DadosLogin) => Promise<void>
  sair: () => void
}

export const AuthContext = createContext<ValorAuth | null>(null)

export function useAuth() {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return valor
}
