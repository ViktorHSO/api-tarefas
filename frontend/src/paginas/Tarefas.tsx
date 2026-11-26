import { useEffect, useEffectEvent, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ErroApi } from '../api/cliente'
import { useAlterarStatus, useExcluirTarefa, useResumo, useTarefas } from '../api/consultasTarefas'
import type { FiltroTarefas, Ordem, Tarefa } from '../api/tarefas'
import { useAuth } from '../auth/contexto'
import { Bib, type Prioridade, type Status } from '../componentes/Bib'
import { FormularioTarefa } from '../componentes/FormularioTarefa'
import { numeroDePeito } from '../componentes/formatos'
import { IconeBandeira, IconeBusca, IconeMais, LinhaDeChegada } from '../componentes/Ilustracoes'
import { Placar, type Recorte } from '../componentes/Placar'
import { AvisoErro, Botao, Modal } from '../componentes/ui'

/** Próximo passo de cada status: o botão principal do número de peito. */
const PROXIMO: Record<Status, { status: Status; nome: string }> = {
  PENDENTE: { status: 'EM_ANDAMENTO', nome: 'Começar' },
  EM_ANDAMENTO: { status: 'CONCLUIDA', nome: 'Concluir' },
  CONCLUIDA: { status: 'PENDENTE', nome: 'Reabrir' },
}

const STATUS_VALIDOS: Status[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA']
const PRIORIDADES_VALIDAS: Prioridade[] = ['BAIXA', 'MEDIA', 'ALTA']
const ORDENS: { valor: Ordem; nome: string }[] = [
  { valor: 'recentes', nome: 'Mais recentes' },
  { valor: 'prazo', nome: 'Prazo mais próximo' },
  { valor: 'titulo', nome: 'Título (A–Z)' },
]

/** Os filtros ficam na URL: dá para voltar, recarregar e compartilhar a mesma visão. */
function useFiltrosDaUrl() {
  const [params, setParams] = useSearchParams()

  const status = params.get('status') as Status | null
  const prioridade = params.get('prioridade') as Prioridade | null
  const ordem = params.get('ordem') as Ordem | null
  const recorte: Recorte = params.get('atrasadas') === '1' ? 'atrasadas' : status && STATUS_VALIDOS.includes(status) ? status : 'todas'

  const filtro: FiltroTarefas = {
    status: recorte !== 'todas' && recorte !== 'atrasadas' ? recorte : undefined,
    atrasadas: recorte === 'atrasadas' || undefined,
    prioridade: prioridade && PRIORIDADES_VALIDAS.includes(prioridade) ? prioridade : undefined,
    busca: params.get('busca') ?? undefined,
    ordem: ordem && ORDENS.some((o) => o.valor === ordem) ? ordem : 'recentes',
    pagina: Math.max(0, Number(params.get('pagina') ?? 1) - 1) || 0,
  }

  /** Muda um ou mais parâmetros. Qualquer mudança de filtro volta para a primeira página. */
  function alterar(mudancas: Record<string, string | undefined>) {
    setParams(
      (atuais) => {
        const novos = new URLSearchParams(atuais)
        for (const [chave, valor] of Object.entries(mudancas)) {
          if (valor) novos.set(chave, valor)
          else novos.delete(chave)
        }
        if (!('pagina' in mudancas)) novos.delete('pagina')
        return novos
      },
      { replace: !('pagina' in mudancas) },
    )
  }

  function escolherRecorte(novo: Recorte) {
    alterar({
      status: novo !== 'todas' && novo !== 'atrasadas' ? novo : undefined,
      atrasadas: novo === 'atrasadas' ? '1' : undefined,
    })
  }

  const temFiltro = recorte !== 'todas' || !!filtro.prioridade || !!filtro.busca?.trim()
  const limpar = () => setParams({}, { replace: true })

  return { filtro, recorte, alterar, escolherRecorte, temFiltro, limpar }
}

export function Tarefas() {
  const { sessao } = useAuth()
  const primeiroNome = sessao?.nome.split(' ')[0]
  const { filtro, recorte, alterar, escolherRecorte, temFiltro, limpar } = useFiltrosDaUrl()

  const lista = useTarefas(filtro)
  const resumo = useResumo()
  const mudarStatus = useAlterarStatus()
  const excluir = useExcluirTarefa()

  const [editando, setEditando] = useState<Tarefa | 'nova' | null>(null)
  const [excluindo, setExcluindo] = useState<Tarefa | null>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  // Busca: espera a pessoa parar de digitar antes de ir na API.
  const [textoBusca, setTextoBusca] = useState(filtro.busca ?? '')
  const buscaNaUrl = filtro.busca ?? ''
  // A URL mudou por fora (voltar do navegador, link): o campo acompanha.
  const [buscaAnterior, setBuscaAnterior] = useState(buscaNaUrl)
  if (buscaNaUrl !== buscaAnterior) {
    setBuscaAnterior(buscaNaUrl)
    if (buscaNaUrl.trim() !== textoBusca.trim()) setTextoBusca(buscaNaUrl)
  }
  const alterarNoEfeito = useEffectEvent(alterar)
  useEffect(() => {
    if (textoBusca.trim() === buscaNaUrl.trim()) return
    const espera = setTimeout(() => alterarNoEfeito({ busca: textoBusca.trim() || undefined }), 300)
    return () => clearTimeout(espera)
  }, [textoBusca, buscaNaUrl])

  // Excluiu o último item da última página: volta uma página.
  const pagina = lista.data
  useEffect(() => {
    if (pagina && pagina.itens.length === 0 && pagina.pagina > 0 && pagina.totalPaginas > 0) {
      alterarNoEfeito({ pagina: String(pagina.totalPaginas) })
    }
  }, [pagina])

  function mensagemDe(e: unknown, padrao: string) {
    return e instanceof ErroApi ? e.message : padrao
  }

  function avancar(tarefa: Tarefa) {
    setErroAcao(null)
    mudarStatus.mutate(
      { id: tarefa.id, status: PROXIMO[tarefa.status].status },
      { onError: (e) => setErroAcao(mensagemDe(e, 'Não foi possível mudar o status. Tente de novo.')) },
    )
  }

  function confirmarExclusao() {
    if (!excluindo) return
    setErroAcao(null)
    excluir.mutate(excluindo.id, {
      onSuccess: () => setExcluindo(null),
      onError: (e) => {
        setExcluindo(null)
        setErroAcao(mensagemDe(e, 'Não foi possível excluir a tarefa. Tente de novo.'))
      },
    })
  }

  function irParaPagina(numero: number) {
    alterar({ pagina: numero > 1 ? String(numero) : undefined })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const r = resumo.data
  const abertas = r ? r.pendentes + r.emAndamento : 0
  const semNenhumaTarefa = r?.total === 0 && !temFiltro

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="titulo text-[clamp(3.75rem,9vw,7.5rem)]">{primeiroNome ? `Bora, ${primeiroNome}` : 'Suas tarefas'}</h1>
          {r && (
            <p className="mt-4 text-lg text-grafite">
              {r.total === 0
                ? 'Nenhuma tarefa ainda. Que tal começar pela primeira?'
                : `${abertas === 0 ? 'Nenhuma tarefa aberta' : abertas === 1 ? '1 tarefa aberta' : `${abertas} tarefas abertas`}${
                    r.atrasadas > 0 ? `, ${r.atrasadas === 1 ? '1 atrasada' : `${r.atrasadas} atrasadas`}` : ''
                  }.`}
            </p>
          )}
        </div>
        <Botao onClick={() => setEditando('nova')} className="px-7 py-4 text-lg">
          <IconeMais />
          Nova tarefa
        </Botao>
      </div>

      <div className="mt-10">
        <Placar resumo={r} ativo={recorte} aoEscolher={escolherRecorte} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <label htmlFor="busca" className="mb-1.5 block text-sm font-semibold">
            Buscar pelo título
          </label>
          <div className="relative">
            <IconeBusca className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-grafite" />
            <input
              id="busca"
              type="search"
              value={textoBusca}
              onChange={(e) => setTextoBusca(e.target.value)}
              placeholder="Digite parte do título"
              className="w-full border-2 border-tinta bg-papel py-3 pl-11 pr-3.5 text-base outline-none placeholder:text-grafite/70"
            />
          </div>
        </div>
        <Seletor
          rotulo="Prioridade"
          valor={filtro.prioridade ?? ''}
          aoMudar={(v) => alterar({ prioridade: v || undefined })}
          opcoes={[
            { valor: '', nome: 'Todas' },
            { valor: 'ALTA', nome: 'Alta' },
            { valor: 'MEDIA', nome: 'Média' },
            { valor: 'BAIXA', nome: 'Baixa' },
          ]}
        />
        <Seletor
          rotulo="Ordenar por"
          valor={filtro.ordem ?? 'recentes'}
          aoMudar={(v) => alterar({ ordem: v === 'recentes' ? undefined : v })}
          opcoes={ORDENS}
        />
      </div>

      {erroAcao && (
        <div className="mt-6">
          <AvisoErro>{erroAcao}</AvisoErro>
        </div>
      )}

      <div className="mt-8" aria-busy={lista.isFetching}>
        {lista.isPending ? (
          <Esqueleto />
        ) : lista.isError ? (
          <div className="flex flex-col items-start gap-4">
            <AvisoErro>{mensagemDe(lista.error, 'Não foi possível carregar as tarefas.')}</AvisoErro>
            <Botao variante="secundario" onClick={() => lista.refetch()}>
              Tentar de novo
            </Botao>
          </div>
        ) : semNenhumaTarefa ? (
          <Vazio
            titulo="A largada é sua"
            texto="Crie sua primeira tarefa. Ela ganha um número de peito, uma prioridade e, se quiser, um prazo."
            acao={<Botao onClick={() => setEditando('nova')}>Criar a primeira tarefa</Botao>}
          />
        ) : lista.data.itens.length === 0 ? (
          <Vazio
            titulo="Nada por aqui"
            texto="Nenhuma tarefa combina com esses filtros."
            acao={
              <Botao
                variante="secundario"
                onClick={() => {
                  setTextoBusca('')
                  limpar()
                }}
              >
                Limpar filtros
              </Botao>
            }
          />
        ) : (
          <>
            <ul
              className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${lista.isPlaceholderData ? 'opacity-60' : ''}`}
              aria-label="Lista de tarefas"
            >
              {lista.data.itens.map((tarefa) => {
                const mudando = mudarStatus.isPending && mudarStatus.variables?.id === tarefa.id
                return (
                  <li key={tarefa.id}>
                    <Bib
                      numero={tarefa.id}
                      titulo={tarefa.titulo}
                      prioridade={tarefa.prioridade}
                      status={tarefa.status}
                      prazo={tarefa.prazo}
                      atrasada={tarefa.atrasada}
                      className="h-full"
                      acoes={
                        <div className="flex items-center gap-4">
                          <Botao
                            variante={tarefa.status === 'CONCLUIDA' ? 'secundario' : 'primario'}
                            className="flex-1 px-3 py-2"
                            disabled={mudando}
                            onClick={() => avancar(tarefa)}
                            aria-label={`${PROXIMO[tarefa.status].nome} a tarefa ${numeroDePeito(tarefa.id)}`}
                          >
                            {mudando ? '…' : PROXIMO[tarefa.status].nome}
                          </Botao>
                          <button
                            type="button"
                            onClick={() => setEditando(tarefa)}
                            className="text-sm font-semibold underline-offset-4 hover:underline"
                            aria-label={`Editar a tarefa ${numeroDePeito(tarefa.id)}`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setExcluindo(tarefa)}
                            className="text-sm font-semibold text-pista underline-offset-4 hover:underline"
                            aria-label={`Excluir a tarefa ${numeroDePeito(tarefa.id)}`}
                          >
                            Excluir
                          </button>
                        </div>
                      }
                    />
                  </li>
                )
              })}
            </ul>

            {lista.data.totalPaginas > 1 && (
              <nav className="mt-10 flex items-center justify-between gap-4 border-t-2 border-tinta pt-5" aria-label="Paginação">
                <Botao variante="secundario" disabled={lista.data.pagina === 0} onClick={() => irParaPagina(lista.data.pagina)}>
                  ← Anterior
                </Botao>
                <p className="font-semibold">
                  Página {lista.data.pagina + 1} de {lista.data.totalPaginas}
                </p>
                <Botao
                  variante="secundario"
                  disabled={lista.data.pagina + 1 >= lista.data.totalPaginas}
                  onClick={() => irParaPagina(lista.data.pagina + 2)}
                >
                  Próxima →
                </Botao>
              </nav>
            )}
          </>
        )}
      </div>

      {editando && <FormularioTarefa tarefa={editando === 'nova' ? undefined : editando} aoFechar={() => setEditando(null)} />}

      {excluindo && (
        <Modal titulo="Excluir tarefa" aoFechar={() => setExcluindo(null)}>
          <p className="text-lg">
            A tarefa <strong>{numeroDePeito(excluindo.id)}</strong>, “{excluindo.titulo}”, vai ser excluída. Não dá para desfazer.
          </p>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Botao variante="secundario" onClick={() => setExcluindo(null)} data-autofoco>
              Cancelar
            </Botao>
            <Botao variante="perigo" onClick={confirmarExclusao} disabled={excluir.isPending}>
              {excluir.isPending ? 'Excluindo…' : 'Excluir'}
            </Botao>
          </div>
        </Modal>
      )}
    </section>
  )
}

function Seletor({
  rotulo,
  valor,
  aoMudar,
  opcoes,
}: {
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  opcoes: { valor: string; nome: string }[]
}) {
  const id = `filtro-${rotulo.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {rotulo}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="w-full border-2 border-tinta bg-papel px-3.5 py-3 text-base font-medium sm:w-auto"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.nome}
          </option>
        ))}
      </select>
    </div>
  )
}

function Vazio({ titulo, texto, acao }: { titulo: string; texto: string; acao: React.ReactNode }) {
  return (
    <div className="border-2 border-dashed border-tinta">
      <LinhaDeChegada className="text-tinta" />
      <div className="flex flex-col items-start px-6 py-12 sm:px-10">
        <IconeBandeira className="mb-5 size-12" />
        <h2 className="titulo text-[clamp(3rem,7vw,5rem)]">{titulo}</h2>
        <p className="mt-4 max-w-[32rem] text-lg text-grafite">{texto}</p>
        <div className="mt-6">{acao}</div>
      </div>
    </div>
  )
}

function Esqueleto() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Carregando tarefas">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="h-72 animate-pulse border-2 border-concreto bg-concreto/60" />
      ))}
    </ul>
  )
}
