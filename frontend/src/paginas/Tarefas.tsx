import { useAuth } from '../auth/contexto'

/** Página inicial da área logada. A lista de tarefas entra na próxima etapa. */
export function Tarefas() {
  const { sessao } = useAuth()
  const primeiroNome = sessao?.nome.split(' ')[0]

  return (
    <section>
      <h1 className="titulo text-[clamp(4rem,10vw,8rem)]">{primeiroNome ? `Bora, ${primeiroNome}` : 'Suas tarefas'}</h1>
      <p className="mt-6 max-w-[36rem] text-lg text-grafite">Sua conta está pronta. A lista de tarefas aparece aqui.</p>
    </section>
  )
}
