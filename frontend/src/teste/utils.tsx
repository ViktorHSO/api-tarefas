import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Rotas } from '../App'
import { AuthProvider } from '../auth/AuthContext'

/** Renderiza a aplicação inteira numa rota, sem tentar de novo requisições que falham. */
export function renderizarEm(rota: string) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter initialEntries={[rota]}>
        <AuthProvider>
          <Rotas />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

/** Resposta JSON falsa para substituir o fetch nos testes. */
export function respostaJson(status: number, corpo?: unknown) {
  return new Response(corpo === undefined ? null : JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function tokenFalso(nome: string) {
  const base64 = (o: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${base64({ alg: 'HS256' })}.${base64({ sub: '1', nome })}.assinatura`
}
