import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ErroApi } from '../api/cliente'
import type { Tarefa } from '../api/tarefas'
import type { Prioridade } from '../componentes/Bib'
import { AvisoErro, Botao, Campo } from '../componentes/ui'
import { useSalvarTarefa } from './consultas'

const PRIORIDADES: { valor: Prioridade; nome: string; faixa: string }[] = [
  { valor: 'BAIXA', nome: 'Baixa', faixa: 'bg-concreto border-b-2 border-tinta' },
  { valor: 'MEDIA', nome: 'Média', faixa: 'bg-tinta' },
  { valor: 'ALTA', nome: 'Alta', faixa: 'bg-pista' },
]

type Props = {
  aberto: boolean
  /** Tarefa sendo editada; sem ela, o formulário cria uma nova. */
  tarefa?: Tarefa | null
  aoFechar: () => void
  aoSalvar: (mensagem: string) => void
}

/** Painel lateral para criar ou editar uma tarefa. Usa <dialog>, que já prende o foco e fecha com Esc. */
export function FormTarefa({ aberto, tarefa, aoFechar, aoSalvar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()
  const salvar = useSalvarTarefa()

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<Prioridade>('MEDIA')
  const [prazo, setPrazo] = useState('')
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)

  useEffect(() => {
    const el = dialogo.current
    if (!el) return
    if (aberto && !el.open) {
      setTitulo(tarefa?.titulo ?? '')
      setDescricao(tarefa?.descricao ?? '')
      setPrioridade(tarefa?.prioridade ?? 'MEDIA')
      setPrazo(tarefa?.prazo ?? '')
      setErros({})
      setErroGeral(null)
      el.showModal()
    } else if (!aberto && el.open) {
      el.close()
    }
  }, [aberto, tarefa])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErros({})
    setErroGeral(null)
    try {
      await salvar.mutateAsync({
        id: tarefa?.id,
        dados: { titulo, descricao: descricao.trim() || null, prioridade, prazo: prazo || null },
      })
      aoSalvar(tarefa ? 'Tarefa salva.' : 'Tarefa criada.')
    } catch (e) {
      if (e instanceof ErroApi && Object.keys(e.erros).length > 0) setErros(e.erros)
      else setErroGeral(e instanceof ErroApi ? e.message : 'Não foi possível salvar. Tente de novo.')
    }
  }

  return (
    <dialog
      ref={dialogo}
      onClose={aoFechar}
      aria-labelledby={idTitulo}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-[34rem] border-l-2 border-tinta bg-papel p-0 text-tinta backdrop:bg-tinta/45 open:animate-[entrar-painel_260ms_cubic-bezier(0.2,0.8,0.2,1)]"
    >
      <form onSubmit={enviar} noValidate className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b-2 border-tinta px-6 py-5">
          <h2 id={idTitulo} className="titulo text-6xl">
            {tarefa ? 'Editar tarefa' : 'Nova tarefa'}
          </h2>
          <button type="button" onClick={aoFechar} className="mt-1 font-semibold underline-offset-4 hover:underline">
            Fechar
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
          {erroGeral && <AvisoErro>{erroGeral}</AvisoErro>}
          <Campo rotulo="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} erro={erros.titulo} maxLength={120} required autoFocus />

          <div>
            <label htmlFor={`${idTitulo}-descricao`} className="mb-1.5 block text-sm font-semibold">
              Descrição <span className="font-normal text-grafite">(opcional)</span>
            </label>
            <textarea
              id={`${idTitulo}-descricao`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={2000}
              rows={4}
              className="w-full resize-y border-2 border-tinta bg-papel px-3.5 py-3"
            />
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">Prioridade</legend>
            <div className="grid grid-cols-3 gap-2">
              {PRIORIDADES.map((opcao) => (
                <label
                  key={opcao.valor}
                  className={`flex cursor-pointer flex-col border-2 border-tinta has-[:checked]:outline-3 has-[:checked]:outline-offset-[-6px] has-[:checked]:outline-tinta has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-pista`}
                >
                  <span aria-hidden="true" className={`h-2.5 ${opcao.faixa}`} />
                  <input
                    type="radio"
                    name="prioridade"
                    value={opcao.valor}
                    checked={prioridade === opcao.valor}
                    onChange={() => setPrioridade(opcao.valor)}
                    className="sr-only"
                  />
                  <span className="px-3 py-3 text-center font-semibold">{opcao.nome}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Campo rotulo="Prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} erro={erros.prazo} dica="Opcional." className="max-w-[16rem]" />
        </div>

        <div className="flex gap-3 border-t-2 border-tinta px-6 py-5">
          <Botao type="submit" disabled={salvar.isPending} className="flex-1 py-4 text-lg">
            {salvar.isPending ? 'Salvando…' : tarefa ? 'Salvar tarefa' : 'Criar tarefa'}
          </Botao>
          <Botao type="button" variante="secundario" onClick={aoFechar} className="py-4 text-lg">
            Cancelar
          </Botao>
        </div>
      </form>
    </dialog>
  )
}
