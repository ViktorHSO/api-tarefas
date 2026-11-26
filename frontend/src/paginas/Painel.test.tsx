import { screen } from '@testing-library/react'
import { salvarSessao } from '../auth/sessao'
import { renderizarEm, respostaJson, tokenFalso } from '../teste/utils'

function simularApi(resumo: object, atrasadas: object[] = []) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) =>
    String(url).includes('/resumo')
      ? respostaJson(200, resumo)
      : respostaJson(200, { itens: atrasadas, pagina: 0, tamanho: 5, totalItens: atrasadas.length, totalPaginas: 1 }),
  )
}

beforeEach(() => {
  salvarSessao(tokenFalso('Ana'), new Date(Date.now() + 3_600_000).toISOString())
})

describe('painel', () => {
  it('mostra quantas tarefas cruzaram a linha e a porcentagem', async () => {
    simularApi({ total: 8, pendentes: 3, emAndamento: 1, concluidas: 4, atrasadas: 0 })
    renderizarEm('/painel')

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('4 de 8cruzaram a linha')
    expect(screen.getByRole('img', { name: /50% das tarefas concluídas/ })).toBeInTheDocument()
    expect(screen.getByText('Nenhuma tarefa atrasada. Segue nesse ritmo.')).toBeInTheDocument()
  })

  it('lista as atrasadas mais antigas primeiro', async () => {
    const fetch = simularApi({ total: 3, pendentes: 2, emAndamento: 0, concluidas: 1, atrasadas: 1 }, [
      { id: 42, titulo: 'Pagar a conta', prioridade: 'ALTA', status: 'PENDENTE', prazo: '2026-11-20', atrasada: true },
    ])
    renderizarEm('/painel')

    expect(await screen.findByText('Pagar a conta')).toBeInTheDocument()
    expect(screen.getByText('042')).toBeInTheDocument()
    expect(screen.getByText('Venceu em 20 nov')).toBeInTheDocument()
    const listagem = fetch.mock.calls.map(([url]) => String(url)).find((url) => url.includes('atrasadas=true'))
    expect(listagem).toContain('sort=prazo%2Casc')
  })

  it('convida a criar tarefas quando ainda não há nenhuma', async () => {
    simularApi({ total: 0, pendentes: 0, emAndamento: 0, concluidas: 0, atrasadas: 0 })
    renderizarEm('/painel')

    expect(await screen.findByRole('heading', { name: 'Nada na pista ainda' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir para as tarefas' })).toHaveAttribute('href', '/tarefas')
  })
})
