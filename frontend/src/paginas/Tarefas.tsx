import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import type { Filtros as ValorFiltros, Tarefa } from '../api/tarefas'
import { useAviso } from '../componentes/Aviso'
import { Bib, type Prioridade, type Status } from '../componentes/Bib'
import { AvisoErro, Botao } from '../componentes/ui'
import { useListaTarefas } from '../tarefas/consultas'
import { Filtros } from '../tarefas/Filtros'
import { FormTarefa } from '../tarefas/FormTarefa'
import { Paginacao } from '../tarefas/Paginacao'

/** Os filtros ficam na URL: dá para recarregar ou compartilhar a página sem perder a busca. */
function useFiltrosNaUrl() {
  const [parametros, setParametros] = useSearchParams()

  const filtros: ValorFiltros = useMemo(
    () => ({
      status: (parametros.get('status') as Status) || undefined,
      prioridade: (parametros.get('prioridade') as Prioridade) || undefined,
      atrasadas: parametros.get('atrasadas') === '1' || undefined,
      busca: parametros.get('busca') || undefined,
    }),
    [parametros],
  )
  const pagina = Math.max(0, Number(parametros.get('pagina') ?? 1) - 1) || 0

  const mudarFiltros = useCallback(
    (novos: ValorFiltros) => {
      const p = new URLSearchParams()
      if (novos.status) p.set('status', novos.status)
      if (novos.prioridade) p.set('prioridade', novos.prioridade)
      if (novos.atrasadas) p.set('atrasadas', '1')
      if (novos.busca) p.set('busca', novos.busca)
      setParametros(p, { replace: true })
    },
    [setParametros],
  )

  const mudarPagina = useCallback(
    (nova: number) => {
      setParametros((atual) => {
        const p = new URLSearchParams(atual)
        if (nova > 0) p.set('pagina', String(nova + 1))
        else p.delete('pagina')
        return p
      })
      window.scrollTo({ top: 0 })
    },
    [setParametros],
  )

  const temFiltro = Object.values(filtros).some(Boolean)
  return { filtros, pagina, mudarFiltros, mudarPagina, temFiltro }
}

export function Tarefas() {
  const { filtros, pagina, mudarFiltros, mudarPagina, temFiltro } = useFiltrosNaUrl()
  const consulta = useListaTarefas(filtros, pagina)
  const { avisar, elemento: aviso } = useAviso()

  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Tarefa | null>(null)

  const abrirNova = () => {
    setEditando(null)
    setFormAberto(true)
  }

  const dados = consulta.data
  const total = dados?.totalItens ?? 0

  return (
    <section>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="titulo text-[clamp(4rem,10vw,8.5rem)]">Suas tarefas</h1>
          <p className="mt-3 min-h-7 text-lg text-grafite" aria-live="polite">
            {dados ? `${total} ${total === 1 ? 'tarefa' : 'tarefas'}${temFiltro ? ' com esses filtros' : ''}` : ''}
          </p>
        </div>
        <Botao onClick={abrirNova} className="self-start px-8 py-4 text-lg sm:self-auto">
          Nova tarefa
        </Botao>
      </div>

      <div className="mt-8">
        <Filtros key={filtros.busca ?? ''} filtros={filtros} aoMudar={mudarFiltros} />
      </div>

      <div className="mt-10">
        {consulta.isError && !dados ? (
          <div className="max-w-[32rem]">
            <AvisoErro>{consulta.error.message}</AvisoErro>
            <Botao variante="secundario" className="mt-4" onClick={() => consulta.refetch()}>
              Tentar de novo
            </Botao>
          </div>
        ) : !dados ? (
          <GradeCarregando />
        ) : dados.itens.length === 0 ? (
          temFiltro ? (
            <Vazio titulo="Nada com esses filtros" texto="Tente outro status ou prioridade, ou limpe a busca.">
              <Botao variante="secundario" onClick={() => mudarFiltros({})}>
                Limpar filtros
              </Botao>
            </Vazio>
          ) : (
            <Vazio titulo="Pista livre" texto="Você não tem nenhuma tarefa. Crie a primeira e ela aparece aqui com o número dela.">
              <Botao onClick={abrirNova}>Criar primeira tarefa</Botao>
            </Vazio>
          )
        ) : (
          <>
            <ul className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}>
              {dados.itens.map((tarefa) => (
                <li key={tarefa.id}>
                  <Bib
                    numero={tarefa.id}
                    titulo={tarefa.titulo}
                    prioridade={tarefa.prioridade}
                    status={tarefa.status}
                    prazo={tarefa.prazo}
                    atrasada={tarefa.atrasada}
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
            <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} aoMudar={mudarPagina} />
          </>
        )}
      </div>

      <FormTarefa
        aberto={formAberto}
        tarefa={editando}
        aoFechar={() => setFormAberto(false)}
        aoSalvar={(mensagem) => {
          setFormAberto(false)
          avisar(mensagem)
        }}
      />
      {aviso}
    </section>
  )
}

function Vazio({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="border-2 border-dashed border-tinta px-6 py-16 text-center">
      <h2 className="titulo text-[clamp(3.5rem,8vw,6rem)]">{titulo}</h2>
      <p className="mx-auto mt-4 max-w-[30rem] text-lg text-grafite">{texto}</p>
      <div className="mt-8 flex justify-center">{children}</div>
    </div>
  )
}

function GradeCarregando() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" aria-label="Carregando tarefas">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="h-[22rem] animate-pulse border-2 border-concreto bg-concreto/60" />
      ))}
    </ul>
  )
}
