import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderizarEm, respostaJson, tokenFalso } from '../teste/utils'

const daquiAUmaHora = () => new Date(Date.now() + 3_600_000).toISOString()

describe('login', () => {
  it('mostra a mensagem da API quando as credenciais estão erradas', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      respostaJson(401, { title: 'Não autorizado', detail: 'E-mail ou senha inválidos.' }),
    )
    renderizarEm('/entrar')

    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-errada')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
  })

  it('entra e leva para a área logada com o nome da pessoa', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(respostaJson(200, { accessToken: tokenFalso('Ana Souza'), tipo: 'Bearer', expiraEm: daquiAUmaHora() }))
    renderizarEm('/entrar')

    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-certa')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Ana Souza')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'ana@exemplo.com', senha: 'senha-certa' }) }),
    )
  })

  it('manda quem não está logado da área de tarefas para o login', () => {
    renderizarEm('/tarefas')

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })
})

describe('cadastro', () => {
  it('mostra o erro de cada campo devolvido pela API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      respostaJson(400, {
        title: 'Dados inválidos',
        detail: 'Um ou mais campos têm valores inválidos.',
        erros: { senha: 'A senha deve ter entre 8 e 72 caracteres.' },
      }),
    )
    renderizarEm('/criar-conta')

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), '123')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('A senha deve ter entre 8 e 72 caracteres.')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'true')
  })

  it('não envia quando a confirmação da senha é diferente', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    renderizarEm('/criar-conta')

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-forte-1')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'senha-forte-2')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(screen.getByText('As senhas não são iguais.')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar senha')).toHaveAttribute('aria-invalid', 'true')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('envia só nome, e-mail e senha para a API', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respostaJson(500))
    renderizarEm('/criar-conta')

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-forte')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'senha-forte')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('A API não respondeu. Confira se ela está rodando e tente de novo.')
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/registro',
      expect.objectContaining({ body: JSON.stringify({ nome: 'Ana', email: 'ana@exemplo.com', senha: 'senha-forte' }) }),
    )
  })
})

describe('campo de senha', () => {
  it('mostra e esconde o que foi digitado', async () => {
    renderizarEm('/entrar')
    const senha = screen.getByLabelText('Senha')
    await userEvent.type(senha, 'segredo123')
    expect(senha).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(senha).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: 'Esconder senha' }))
    expect(senha).toHaveAttribute('type', 'password')
  })
})
