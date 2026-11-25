import type { ReactNode } from 'react'
import { diaMes, numeroDePeito } from './formatos'

export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA'
export type Status = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA'

const NOME_PRIORIDADE: Record<Prioridade, string> = {
  BAIXA: 'Prioridade baixa',
  MEDIA: 'Prioridade média',
  ALTA: 'Prioridade alta',
}

/** A faixa do topo carrega a prioridade: laranja de pista para alta, preto para média, concreto para baixa. */
const FAIXA: Record<Prioridade, string> = {
  ALTA: 'bg-pista',
  MEDIA: 'bg-tinta',
  BAIXA: 'bg-concreto border-b-2 border-tinta',
}

type Props = {
  numero: number
  titulo: string
  prioridade: Prioridade
  status: Status
  prazo?: string | null
  atrasada?: boolean
  /** Ações (mudar status, editar...) mostradas no rodapé do número de peito. */
  acoes?: ReactNode
  className?: string
}

/**
 * Cada tarefa é um número de peito de corrida: o id em tamanho grande,
 * furos de alfinete nos cantos e a prioridade na faixa do topo.
 */
export function Bib({ numero, titulo, prioridade, status, prazo, atrasada = false, acoes, className = '' }: Props) {
  const concluida = status === 'CONCLUIDA'

  return (
    <article
      aria-label={`Tarefa ${numeroDePeito(numero)}: ${titulo}`}
      className={`relative flex flex-col border-2 border-tinta bg-papel ${className}`}
    >
      <div className={`h-3.5 ${FAIXA[prioridade]}`} aria-hidden="true" />
      <Furo className="left-3 top-7" />
      <Furo className="right-3 top-7" />

      <div className="flex flex-1 flex-col px-6 pb-7 pt-5">
        <p
          className={`titulo text-center text-[clamp(4.5rem,9vw,6.5rem)] ${concluida ? 'text-transparent [-webkit-text-stroke:2px_var(--color-tinta)]' : ''}`}
        >
          {numeroDePeito(numero)}
        </p>

        <h3 className={`mt-3 line-clamp-2 min-h-[3rem] text-center text-lg font-semibold leading-6 ${concluida ? 'text-grafite line-through decoration-2' : ''}`}>
          {titulo}
        </h3>

        <dl className="mt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t-2 border-tinta pt-3 text-sm">
          <div>
            <dt className="sr-only">Prioridade</dt>
            <dd className="font-medium">{NOME_PRIORIDADE[prioridade]}</dd>
          </div>
          <div className="text-right">
            <dt className="sr-only">Prazo</dt>
            <dd className={atrasada ? 'font-bold text-pista' : 'text-grafite'}>
              {concluida ? 'Concluída' : prazo ? (atrasada ? `Venceu em ${diaMes(prazo)}` : `Até ${diaMes(prazo)}`) : 'Sem prazo'}
            </dd>
          </div>
        </dl>

        {acoes && <div className="mt-4">{acoes}</div>}
      </div>

      <Furo className="bottom-2.5 left-2.5" />
      <Furo className="bottom-2.5 right-2.5" />
    </article>
  )
}

function Furo({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute size-2.5 rounded-full border-2 border-tinta bg-papel ${className}`} />
}
