import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as loginApi, type DadosLogin } from '../api/auth'
import { EVENTO_SESSAO_EXPIRADA } from '../api/cliente'
import { AuthContext } from './contexto'
import { apagarSessao, lerSessao, salvarSessao, type Sessao } from './sessao'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => lerSessao())

  const sair = useCallback(() => {
    apagarSessao()
    setSessao(null)
  }, [])

  const entrar = useCallback(async (dados: DadosLogin) => {
    const resposta = await loginApi(dados)
    setSessao(salvarSessao(resposta.accessToken, resposta.expiraEm))
  }, [])

  // Token recusado pela API (expirou ou foi invalidado): volta para o login.
  useEffect(() => {
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, sair)
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, sair)
  }, [sair])

  const valor = useMemo(() => ({ sessao, entrar, sair }), [sessao, entrar, sair])
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
