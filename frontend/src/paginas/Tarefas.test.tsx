import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Pagina, Resumo, Tarefa } from '../api/tarefas'
import { salvarSessao } from '../auth/sessao'
import { renderizarEm, respostaJson, tokenFalso } from '../teste/utils'

function tarefa(dados: Partial<Tarefa> & Pick<Tarefa, 'id' | 'titulo'>): Tarefa {
  return {
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

function pagina(itens: Tarefa[], extra: Partial<Pagina<Tarefa>> = {}): Pagina<Tarefa> {
  return { itens, pagina: 0, tamanho: 12, totalItens: itens.length, totalPaginas: itens.length ? 1 : 0, ...extra }
}

const RESUMO: Resumo = { total: 2, pendentes: 1, emAndamento: 1, concluidas: 0, atrasadas: 1 }

const TAREFAS = [
  tarefa({ id: 7, titulo: 'Pagar a conta de luz', prioridade: 'ALTA', prazo: '2026-11-20', atrasada: true }),
  tarefa({ id: 8, titulo: 'Treino de corrida', status: 'EM_ANDAMENTO' }),
]

type Rota = (url: string, init?: RequestInit) => Response | undefined

/** Simula a API: cada chamada passa pelas rotas na ordem até uma responder. */
function simularApi(...rotas: Rota[]) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada, init) => {
    const url = String(entrada)
    for (const rota of rotas) {
      const resposta = rota(url, init)
      if (resposta) return resposta
    }
    if (url.startsWith('/api/tarefas/resumo')) return respostaJson(200, RESUMO)
    if (url.startsWith('/api/tarefas?')) return respostaJson(200, pagina(TAREFAS))
    return respostaJson(404, { title: 'Não encontrado', detail: `Rota não simulada: ${url}` })
  })
}

const chamadas = (fetch: ReturnType<typeof simularApi>, metodo: string) =>
  fetch.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === metodo).map(([url, init]) => ({ url: String(url), init }))

beforeEach(() => {
  salvarSessao(tokenFalso('Ana Souza'), new Date(Date.now() + 3_600_000).toISOString())
})

describe('página de tarefas', () => {
  it('mostra o resumo e as tarefas como números de peito', async () => {
    simularApi()
    renderizarEm('/tarefas')

    expect(await screen.findByRole('article', { name: 'Tarefa 007: Pagar a conta de luz' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Tarefa 008: Treino de corrida' })).toBeInTheDocument()
    expect(screen.getByText('Venceu em 20 nov')).toBeInTheDocument()
    expect(await screen.findByText('2 tarefas abertas, 1 atrasada.')).toBeInTheDocument()
  })

  it('sem nenhuma tarefa, convida a criar a primeira e envia o formulário', async () => {
    let criada = false
    const fetch = simularApi(
      (url) => (url.startsWith('/api/tarefas/resumo') && !criada ? respostaJson(200, { total: 0, pendentes: 0, emAndamento: 0, concluidas: 0, atrasadas: 0 }) : undefined),
      (url) => (url.startsWith('/api/tarefas?') && !criada ? respostaJson(200, pagina([])) : undefined),
      (url, init) => {
        if (url === '/api/tarefas' && init?.method === 'POST') {
          criada = true
          return respostaJson(201, tarefa({ id: 9, titulo: 'Estudar Spring Security', prioridade: 'ALTA' }))
        }
      },
    )
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Criar a primeira tarefa' }))
    const janela = screen.getByRole('dialog', { name: 'Nova tarefa' })
    expect(within(janela).getByLabelText('Título')).toHaveFocus()

    await userEvent.type(within(janela).getByLabelText('Título'), '  Estudar Spring Security ')
    await userEvent.click(within(janela).getByLabelText('Alta'))
    await userEvent.type(within(janela).getByLabelText('Prazo (opcional)'), '2026-12-10')
    await userEvent.click(within(janela).getByRole('button', { name: 'Criar tarefa' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(JSON.parse(String(chamadas(fetch, 'POST')[0].init?.body))).toEqual({
      titulo: 'Estudar Spring Security',
      descricao: null,
      prioridade: 'ALTA',
      prazo: '2026-12-10',
    })
  })

  it('mostra no campo o erro de validação devolvido pela API', async () => {
    simularApi((url, init) =>
      url === '/api/tarefas' && init?.method === 'POST'
        ? respostaJson(400, { title: 'Dados inválidos', detail: '...', erros: { titulo: 'O título pode ter no máximo 120 caracteres.' } })
        : undefined,
    )
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Nova tarefa' }))
    await userEvent.type(screen.getByLabelText('Título'), 'Qualquer coisa')
    await userEvent.click(screen.getByRole('button', { name: 'Criar tarefa' }))

    expect(await screen.findByText('O título pode ter no máximo 120 caracteres.')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true')
  })

  it('não deixa enviar sem título e fecha com Esc', async () => {
    const fetch = simularApi()
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Nova tarefa' }))
    await userEvent.click(screen.getByRole('button', { name: 'Criar tarefa' }))
    expect(screen.getByText('Informe o título.')).toBeInTheDocument()
    expect(chamadas(fetch, 'POST')).toHaveLength(0)

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('edita uma tarefa com os dados já preenchidos', async () => {
    const fetch = simularApi((url, init) =>
      url === '/api/tarefas/7' && init?.method === 'PUT' ? respostaJson(200, TAREFAS[0]) : undefined,
    )
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Editar a tarefa 007' }))
    const titulo = screen.getByLabelText('Título')
    expect(titulo).toHaveValue('Pagar a conta de luz')
    await userEvent.clear(titulo)
    await userEvent.type(titulo, 'Pagar a conta de água')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(chamadas(fetch, 'PUT')).toHaveLength(1))
    expect(JSON.parse(String(chamadas(fetch, 'PUT')[0].init?.body))).toMatchObject({
      titulo: 'Pagar a conta de água',
      prioridade: 'ALTA',
      prazo: '2026-11-20',
    })
  })

  it('o botão do número de peito leva a tarefa para o próximo status', async () => {
    const fetch = simularApi((url, init) =>
      url === '/api/tarefas/8/status' && init?.method === 'PATCH' ? respostaJson(200, { ...TAREFAS[1], status: 'CONCLUIDA' }) : undefined,
    )
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Concluir a tarefa 008' }))

    await waitFor(() => expect(chamadas(fetch, 'PATCH')).toHaveLength(1))
    expect(chamadas(fetch, 'PATCH')[0].init?.body).toBe(JSON.stringify({ status: 'CONCLUIDA' }))
  })

  it('pede confirmação antes de excluir', async () => {
    const fetch = simularApi((url, init) => (url === '/api/tarefas/7' && init?.method === 'DELETE' ? new Response(null, { status: 204 }) : undefined))
    renderizarEm('/tarefas')

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir a tarefa 007' }))
    const janela = screen.getByRole('dialog', { name: 'Excluir tarefa' })
    expect(within(janela).getByText(/Pagar a conta de luz/)).toBeInTheDocument()
    expect(chamadas(fetch, 'DELETE')).toHaveLength(0)

    await userEvent.click(within(janela).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(chamadas(fetch, 'DELETE').map((c) => c.url)).toEqual(['/api/tarefas/7'])
  })

  it('o placar e a busca filtram a lista na API', async () => {
    const fetch = simularApi()
    renderizarEm('/tarefas')
    await screen.findByRole('article', { name: /Tarefa 007/ })

    await userEvent.click(screen.getByRole('button', { name: /Atrasadas/ }))
    await waitFor(() => expect(chamadas(fetch, 'GET').some((c) => c.url.includes('atrasadas=true'))).toBe(true))
    expect(screen.getByRole('button', { name: /Atrasadas/ })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.type(screen.getByLabelText('Buscar pelo título'), 'conta')
    await waitFor(() => expect(chamadas(fetch, 'GET').some((c) => c.url.includes('busca=conta') && c.url.includes('atrasadas=true'))).toBe(true))
  })

  it('com filtro e nenhum resultado, oferece limpar os filtros', async () => {
    simularApi((url) => (url.startsWith('/api/tarefas?') && url.includes('prioridade=BAIXA') ? respostaJson(200, pagina([])) : undefined))
    renderizarEm('/tarefas?prioridade=BAIXA')

    await userEvent.click(await screen.findByRole('button', { name: 'Limpar filtros' }))

    expect(await screen.findByRole('article', { name: /Tarefa 007/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Prioridade')).toHaveValue('')
  })

  it('pagina a lista', async () => {
    const fetch = simularApi((url) =>
      url.startsWith('/api/tarefas?') ? respostaJson(200, pagina(TAREFAS, { totalItens: 14, totalPaginas: 2, pagina: url.includes('page=1') ? 1 : 0 })) : undefined,
    )
    renderizarEm('/tarefas')

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '← Anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima →' }))

    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument()
    expect(chamadas(fetch, 'GET').some((c) => c.url.includes('page=1'))).toBe(true)
  })
})
