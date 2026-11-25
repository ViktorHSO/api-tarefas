import { apagarSessao, lerSessao, salvarSessao } from './sessao'

/** Monta um JWT de mentira (só o conteúdo importa aqui; quem valida a assinatura é a API). */
function tokenCom(conteudo: object) {
  const base64 = (o: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${base64({ alg: 'HS256' })}.${base64(conteudo)}.assinatura`
}

const daquiAUmaHora = () => new Date(Date.now() + 3_600_000).toISOString()

describe('sessão', () => {
  it('guarda o token e lê o nome de dentro dele, com acento', () => {
    salvarSessao(tokenCom({ sub: '1', nome: 'João Conceição' }), daquiAUmaHora())

    expect(lerSessao()?.nome).toBe('João Conceição')
  })

  it('descarta a sessão quando o token já expirou', () => {
    salvarSessao(tokenCom({ sub: '1', nome: 'Ana' }), new Date(Date.now() - 1000).toISOString())

    expect(lerSessao()).toBeNull()
    expect(sessionStorage.length).toBe(0)
  })

  it('ignora conteúdo corrompido no armazenamento', () => {
    sessionStorage.setItem('tarefas.sessao', '{isso não é json')

    expect(lerSessao()).toBeNull()
  })

  it('sair apaga a sessão', () => {
    salvarSessao(tokenCom({ sub: '1', nome: 'Ana' }), daquiAUmaHora())
    apagarSessao()

    expect(lerSessao()).toBeNull()
  })
})
