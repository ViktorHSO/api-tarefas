import { Link } from 'react-router'
import type { Resumo, Tarefa } from '../api/tarefas'
import { diaMes, numeroDePeito } from '../componentes/formatos'
import { AvisoErro, BotaoLink } from '../componentes/ui'
import { useAtrasadas, useResumo } from '../api/consultasTarefas'

export function Painel() {
  const resumo = useResumo()
  const atrasadas = useAtrasadas(5)

  if (resumo.isError) return <AvisoErro>{resumo.error.message}</AvisoErro>
  if (!resumo.data) return <div className="h-[28rem] animate-pulse bg-concreto/60" aria-label="Carregando painel" />

  const { total, concluidas } = resumo.data

  if (total === 0) {
    return (
      <section>
        <h1 className="titulo text-[clamp(4rem,11vw,9rem)]">Nada na pista ainda</h1>
        <p className="mt-6 max-w-[34rem] text-lg text-grafite">Crie suas tarefas e o painel mostra quanto já cruzou a linha de chegada.</p>
        <BotaoLink para="/tarefas" className="mt-8">
          Ir para as tarefas
        </BotaoLink>
      </section>
    )
  }

  return (
    <section>
      <h1 className="titulo text-[clamp(4.5rem,13vw,11rem)]">
        <span className="block">
          {concluidas} de {total}
        </span>
        <span className="block">cruzaram a linha</span>
      </h1>

      <Pista resumo={resumo.data} />

      <section className="mt-16 border-t-2 border-tinta pt-8" aria-labelledby="titulo-atrasadas">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="titulo-atrasadas" className="titulo text-[clamp(3rem,6vw,4.5rem)]">
            Atrasadas
            <span className={`ml-4 ${resumo.data.atrasadas > 0 ? 'text-pista' : 'text-grafite'}`}>{resumo.data.atrasadas}</span>
          </h2>
          {resumo.data.atrasadas > 0 && (
            <Link to="/tarefas?atrasadas=1" className="font-semibold underline underline-offset-4">
              Ver todas as atrasadas
            </Link>
          )}
        </div>

        {resumo.data.atrasadas === 0 ? (
          <p className="mt-6 text-lg text-grafite">Nenhuma tarefa atrasada. Segue nesse ritmo.</p>
        ) : (
          <ul className="mt-6">
            {atrasadas.data?.itens.map((tarefa) => <LinhaAtrasada key={tarefa.id} tarefa={tarefa} />)}
          </ul>
        )}
      </section>
    </section>
  )
}

/**
 * A pista: uma faixa só, dividida pelo que já terminou, o que está em andamento e o que falta.
 * A linha branca no fim é a chegada.
 */
function Pista({ resumo }: { resumo: Resumo }) {
  const partes = [
    { nome: 'Concluídas', valor: resumo.concluidas, estilo: 'bg-tinta' },
    {
      nome: 'Em andamento',
      valor: resumo.emAndamento,
      estilo: 'bg-[repeating-linear-gradient(-45deg,var(--color-tinta)_0_6px,var(--color-papel)_6px_12px)]',
    },
    { nome: 'Pendentes', valor: resumo.pendentes, estilo: 'bg-concreto' },
  ]
  const porcentagem = Math.round((resumo.concluidas / resumo.total) * 100)

  return (
    <figure className="mt-10">
      <div
        role="img"
        aria-label={`${porcentagem}% das tarefas concluídas: ${resumo.concluidas} concluídas, ${resumo.emAndamento} em andamento e ${resumo.pendentes} pendentes.`}
        className="relative flex h-16 border-2 border-tinta sm:h-20"
      >
        {partes
          .filter((parte) => parte.valor > 0)
          .map((parte) => (
            <div
              key={parte.nome}
              className={`${parte.estilo} border-r-2 border-tinta last:border-r-0`}
              style={{ width: `${(parte.valor / resumo.total) * 100}%` }}
            />
          ))}
        <div aria-hidden="true" className="absolute inset-y-0 right-3 w-1.5 bg-papel outline-2 outline-tinta" />
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        <span className="font-bold">{porcentagem}% concluído</span>
        {partes.map((parte) => (
          <span key={parte.nome} className="flex items-center gap-2 text-grafite">
            <span aria-hidden="true" className={`size-4 border-2 border-tinta ${parte.estilo}`} />
            {parte.valor} {parte.nome.toLowerCase()}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

function LinhaAtrasada({ tarefa }: { tarefa: Tarefa }) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b-2 border-concreto py-4 sm:grid-cols-[auto_1fr_auto]">
      <span className="titulo text-5xl">{numeroDePeito(tarefa.id)}</span>
      <span className="text-lg font-semibold">{tarefa.titulo}</span>
      <span className="col-start-2 font-bold text-pista sm:col-start-auto">{tarefa.prazo && `Venceu em ${diaMes(tarefa.prazo)}`}</span>
    </li>
  )
}
