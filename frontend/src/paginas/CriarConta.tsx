import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { cadastrar } from '../api/auth'
import { ErroApi } from '../api/cliente'
import { useAuth } from '../auth/contexto'
import { AvisoErro, Botao, Campo } from '../componentes/ui'
import { LayoutAuth } from './LayoutAuth'

export function CriarConta() {
  const { entrar } = useAuth()
  const navegar = useNavigate()

  const [dados, setDados] = useState({ nome: '', email: '', senha: '', confirmacao: '' })
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({})
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const alterar = (campo: keyof typeof dados) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDados((atual) => ({ ...atual, [campo]: e.target.value }))

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setErrosCampos({})
    if (dados.senha !== dados.confirmacao) {
      setErrosCampos({ confirmacao: 'As senhas não são iguais.' })
      return
    }
    setEnviando(true)
    try {
      await cadastrar({ nome: dados.nome, email: dados.email, senha: dados.senha })
      await entrar({ email: dados.email, senha: dados.senha })
      navegar('/tarefas', { replace: true })
    } catch (e) {
      if (e instanceof ErroApi && Object.keys(e.erros).length > 0) setErrosCampos(e.erros)
      else setErro(e instanceof ErroApi ? e.message : 'Não foi possível criar a conta agora. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutAuth titulo="Criar conta">
      <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
        {erro && <AvisoErro>{erro}</AvisoErro>}
        <Campo rotulo="Nome" autoComplete="name" required value={dados.nome} onChange={alterar('nome')} erro={errosCampos.nome} />
        <Campo rotulo="E-mail" type="email" autoComplete="email" required value={dados.email} onChange={alterar('email')} erro={errosCampos.email} />
        <Campo
          rotulo="Senha"
          type="password"
          autoComplete="new-password"
          required
          value={dados.senha}
          onChange={alterar('senha')}
          erro={errosCampos.senha}
          dica="Pelo menos 8 caracteres."
        />
        <Campo
          rotulo="Confirmar senha"
          type="password"
          autoComplete="new-password"
          required
          value={dados.confirmacao}
          onChange={alterar('confirmacao')}
          erro={errosCampos.confirmacao}
        />
        <Botao type="submit" disabled={enviando} className="mt-2 w-full py-4 text-lg">
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Botao>
      </form>
      <p className="mt-8 text-grafite">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-semibold text-tinta underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </LayoutAuth>
  )
}
