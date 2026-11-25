import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ErroApi } from '../api/cliente'
import { useAuth } from '../auth/contexto'
import { AvisoErro, Botao, Campo } from '../componentes/ui'
import { LayoutAuth } from './LayoutAuth'

export function Entrar() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()
  const destino = (local.state as { de?: string } | null)?.de ?? '/tarefas'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await entrar({ email, senha })
      navegar(destino, { replace: true })
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível entrar agora. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutAuth titulo="Entrar">
      <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
        {erro && <AvisoErro>{erro}</AvisoErro>}
        <Campo rotulo="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo rotulo="Senha" type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        <Botao type="submit" disabled={enviando} className="mt-2 w-full py-4 text-lg">
          {enviando ? 'Entrando…' : 'Entrar'}
        </Botao>
      </form>
      <p className="mt-8 text-grafite">
        Ainda não tem conta?{' '}
        <Link to="/criar-conta" className="font-semibold text-tinta underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </LayoutAuth>
  )
}
