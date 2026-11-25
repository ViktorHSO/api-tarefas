import { useEffect, useId, useState } from 'react'
import type { Filtros as ValorFiltros } from '../api/tarefas'
import type { Prioridade, Status } from '../componentes/Bib'

const OPCOES_STATUS: { valor?: Status; nome: string }[] = [
  { nome: 'Todas' },
  { valor: 'PENDENTE', nome: 'Pendentes' },
  { valor: 'EM_ANDAMENTO', nome: 'Em andamento' },
  { valor: 'CONCLUIDA', nome: 'Concluídas' },
]

const OPCOES_PRIORIDADE: { valor?: Prioridade; nome: string }[] = [
  { nome: 'Qualquer prioridade' },
  { valor: 'ALTA', nome: 'Alta' },
  { valor: 'MEDIA', nome: 'Média' },
  { valor: 'BAIXA', nome: 'Baixa' },
]

type Props = {
  filtros: ValorFiltros
  aoMudar: (filtros: ValorFiltros) => void
}

export function Filtros({ filtros, aoMudar }: Props) {
  const idBusca = useId()
  const [busca, setBusca] = useState(filtros.busca ?? '')

  // Espera a pessoa parar de digitar antes de buscar.
  useEffect(() => {
    if (busca === (filtros.busca ?? '')) return
    const espera = setTimeout(() => aoMudar({ ...filtros, busca: busca || undefined }), 300)
    return () => clearTimeout(espera)
  }, [busca, filtros, aoMudar])

  return (
    <div className="flex flex-col gap-4 border-y-2 border-tinta py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
        {OPCOES_STATUS.map((opcao) => (
          <Alternador key={opcao.nome} ativo={filtros.status === opcao.valor} aoClicar={() => aoMudar({ ...filtros, status: opcao.valor })}>
            {opcao.nome}
          </Alternador>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor={`${idBusca}-prioridade`}>
          Prioridade
        </label>
        <select
          id={`${idBusca}-prioridade`}
          value={filtros.prioridade ?? ''}
          onChange={(e) => aoMudar({ ...filtros, prioridade: (e.target.value || undefined) as Prioridade | undefined })}
          className="border-2 border-tinta bg-papel px-3 py-2 font-semibold"
        >
          {OPCOES_PRIORIDADE.map((opcao) => (
            <option key={opcao.nome} value={opcao.valor ?? ''}>
              {opcao.nome}
            </option>
          ))}
        </select>

        <Alternador ativo={!!filtros.atrasadas} aoClicar={() => aoMudar({ ...filtros, atrasadas: !filtros.atrasadas || undefined })} destaque>
          Só atrasadas
        </Alternador>

        <label className="sr-only" htmlFor={idBusca}>
          Buscar pelo título
        </label>
        <input
          id={idBusca}
          type="search"
          placeholder="Buscar pelo título"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full border-2 border-tinta bg-papel px-3 py-2 placeholder:text-grafite/70 sm:w-64"
        />
      </div>
    </div>
  )
}

function Alternador({
  ativo,
  aoClicar,
  destaque = false,
  children,
}: {
  ativo: boolean
  aoClicar: () => void
  destaque?: boolean
  children: string
}) {
  const cores = ativo
    ? destaque
      ? 'border-pista bg-pista text-papel'
      : 'border-tinta bg-tinta text-papel'
    : 'border-tinta bg-papel hover:bg-concreto'
  return (
    <button type="button" aria-pressed={ativo} onClick={aoClicar} className={`border-2 px-4 py-2 font-semibold ${cores}`}>
      {children}
    </button>
  )
}
