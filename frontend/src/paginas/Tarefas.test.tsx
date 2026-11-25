import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Tarefa } from '../api/tarefas'
import { salvarSessao } from '../auth/sessao'
import { renderizarEm, respostaJson, tokenFalso } from '../teste/utils'

function tarefa(dados: Partial<Tarefa>): Tarefa {
  return {
    id: 1,
    titulo: 'Tarefa',
    descricao: null,
    prioridade: 'MEDIA',
    status: 'PENDENTE',
    prazo: null,
    atrasada: false,
    criadaEm: '2026-11-20T10:00:00',
    atualizadaEm: '2026-11-20T10:00:00',
    concluidaEm: null,
    ...dados,
  }
}

const pagina = (itens: Tarefa[]) => ({ itens, pagina: 0, tamanho: 12, totalItens: itens.length, totalPaginas: 1 })

/** Simula a API: responde a lista com as tarefas dadas e devolve o corpo enviado em POST/PATCH. */
function simularApi(itens: Tarefa[]) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, opcoes) => {
    const metodo = opcoes?.method ?? 'GET'
    if (metodo === 'GET') return respostaJson(200, pagina(itens))
    if (metodo === 'DELETE') return respostaJson(204)
    const corpo = JSON.parse(String(opcoes?.body))
    return respostaJson(metodo === 'POST' ? 201 : 200, tarefa({ id: 99, ...corpo }))
  })
}

beforeEach(() => {
  salvarSessao(tokenFalso('Ana Souza'), new Date(Date.now() + 3_600_000).toISOString())
})

describe('tela de tarefas', () => {
  it('mostra cada tarefa como número de peito e o total', async () => {
    simularApi([
      tarefa({ id: 7, titulo: 'Pagar a conta', prioridade: 'ALTA' }),
      tarefa({ id: 12, titulo: 'Treino', status: 'EM_ANDAMENTO', prazo: '2026-11-20', atrasada: true }),
    ])
    renderizarEm('/tarefas')

    expect(await screen.findByRole('article', { name: 'Tarefa 007: Pagar a conta' })).toBeInTheDocument()
    expect(screen.getByText('Venceu em 20 nov')).toBeInTheDocument()
    expect(screen.getByText('2 tarefas')).toBeInTheDocument()
  })

  it('manda o token e os filtros escolhidos para a API', async () => {
    const fetch = simularApi([])
    renderizarEm('/tarefas')
    await screen.findByText('Pista livre')

    await userEvent.click(screen.getByRole('button', { name: 'Concluídas' }))
    await userEvent.click(screen.getByRole('button', { name: 'Só atrasadas' }))

    await waitFor(() => {
      const [url, opcoes] = fetch.mock.calls.at(-1)!
      expect(String(url)).toContain('status=CONCLUIDA')
      expect(String(url)).toContain('atrasadas=true')
      const cabecalhos = (opcoes?.headers ?? {}) as Record<string, string>
      expect(cabecalhos.Authorization).toMatch(/^Bearer /)
    })
    expect(await screen.findByText('Nada com esses filtros')).toBeInTheDocument()
  })

  it('cria uma tarefa pelo painel lateral', async () => {
    const fetch = simularApi([])
    renderizarEm('/tarefas')
    await screen.findByText('Pista livre')

    await userEvent.click(screen.getByRole('button', { name: 'Nova tarefa' }))
    const painel = screen.getByRole('dialog', { name: 'Nova tarefa' })
    await userEvent.type(within(painel).getByLabelText('Título'), 'Estudar testes')
    await userEvent.click(within(painel).getByLabelText('Alta'))
    await userEvent.click(within(painel).getByRole('button', { name: 'Criar tarefa' }))

    expect(await screen.findByText('Tarefa criada.')).toBeInTheDocument()
    const post = fetch.mock.calls.find(([, opcoes]) => opcoes?.method === 'POST')!
    expect(JSON.parse(String(post[1]!.body))).toEqual({ titulo: 'Estudar testes', descricao: null, prioridade: 'ALTA', prazo: null })
  })

  it('avança o status da tarefa', async () => {
    const fetch = simularApi([tarefa({ id: 5, titulo: 'Revisar currículo', status: 'EM_ANDAMENTO' })])
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Concluir: Revisar currículo' }))

    expect(await screen.findByText('Tarefa concluída.')).toBeInTheDocument()
    const patch = fetch.mock.calls.find(([, opcoes]) => opcoes?.method === 'PATCH')!
    expect(String(patch[0])).toBe('/api/tarefas/5/status')
    expect(JSON.parse(String(patch[1]!.body))).toEqual({ status: 'CONCLUIDA' })
  })

  it('pede confirmação antes de excluir', async () => {
    const fetch = simularApi([tarefa({ id: 8, titulo: 'Rascunho' })])
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir: Rascunho' }))
    expect(fetch.mock.calls.some(([, opcoes]) => opcoes?.method === 'DELETE')).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
    expect(await screen.findByText('Tarefa excluída.')).toBeInTheDocument()
  })

  it('mostra o erro da API e permite tentar de novo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respostaJson(500, { title: 'Erro', detail: 'Erro interno do servidor.' }))
    renderizarEm('/tarefas')

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno do servidor.')
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
  })
})
