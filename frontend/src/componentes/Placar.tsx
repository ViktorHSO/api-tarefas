import type { Resumo } from '../api/tarefas'
import type { Status } from './Bib'

export type Recorte = 'todas' | Status | 'atrasadas'

type Props = {
  resumo?: Resumo
  ativo: Recorte
  aoEscolher: (recorte: Recorte) => void
}

/**
 * Placar do resumo, como o quadro de resultados de uma prova.
 * Cada casa também é um atalho para filtrar a lista.
 */
export function Placar({ resumo, ativo, aoEscolher }: Props) {
  const casas: { recorte: Recorte; nome: string; valor?: number }[] = [
    { recorte: 'todas', nome: 'Total', valor: resumo?.total },
    { recorte: 'PENDENTE', nome: 'Pendentes', valor: resumo?.pendentes },
    { recorte: 'EM_ANDAMENTO', nome: 'Em andamento', valor: resumo?.emAndamento },
    { recorte: 'CONCLUIDA', nome: 'Concluídas', valor: resumo?.concluidas },
    { recorte: 'atrasadas', nome: 'Atrasadas', valor: resumo?.atrasadas },
  ]

  return (
    <ul className="grid grid-cols-2 border-l-2 border-t-2 border-tinta sm:grid-cols-3 lg:grid-cols-5" aria-label="Resumo das tarefas">
      {casas.map(({ recorte, nome, valor }) => {
        const selecionada = ativo === recorte
        const alerta = recorte === 'atrasadas' && (valor ?? 0) > 0
        return (
          <li key={recorte} className={`border-b-2 border-r-2 border-tinta ${recorte === 'todas' ? 'col-span-2 sm:col-span-1' : ''}`}>
            <button
              type="button"
              aria-pressed={selecionada}
              onClick={() => aoEscolher(selecionada && recorte !== 'todas' ? 'todas' : recorte)}
              className={`flex h-full w-full flex-col items-start px-5 pb-4 pt-3 text-left transition-colors ${
                selecionada ? 'bg-tinta text-papel' : alerta ? 'bg-pista text-papel hover:bg-tinta' : 'hover:bg-concreto'
              }`}
            >
              <span className="titulo text-[clamp(3.5rem,6vw,5rem)]" aria-hidden={valor === undefined}>
                {valor ?? '–'}
              </span>
              <span className="mt-1 text-sm font-semibold">{nome}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
