import { useState, type FormEvent } from 'react'
import { ErroApi } from '../api/cliente'
import { useSalvarTarefa } from '../api/consultasTarefas'
import type { Tarefa } from '../api/tarefas'
import type { Prioridade } from './Bib'
import { AvisoErro, Botao, Campo, CampoTexto, Modal } from './ui'

const PRIORIDADES: { valor: Prioridade; nome: string; faixa: string }[] = [
  { valor: 'BAIXA', nome: 'Baixa', faixa: 'bg-concreto border-b-2 border-tinta' },
  { valor: 'MEDIA', nome: 'Média', faixa: 'bg-tinta' },
  { valor: 'ALTA', nome: 'Alta', faixa: 'bg-pista' },
]

type Props = {
  /** Tarefa a editar; sem ela, o formulário cria uma nova. */
  tarefa?: Tarefa
  aoFechar: () => void
}

export function FormularioTarefa({ tarefa, aoFechar }: Props) {
  const salvar = useSalvarTarefa()
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '')
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? '')
  const [prioridade, setPrioridade] = useState<Prioridade>(tarefa?.prioridade ?? 'MEDIA')
  const [prazo, setPrazo] = useState(tarefa?.prazo ?? '')
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({})
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setErrosCampos({})
    if (!titulo.trim()) {
      setErrosCampos({ titulo: 'Informe o título.' })
      return
    }
    try {
      await salvar.mutateAsync({
        id: tarefa?.id,
        dados: { titulo: titulo.trim(), descricao: descricao.trim() || null, prioridade, prazo: prazo || null },
      })
      aoFechar()
    } catch (e) {
      if (e instanceof ErroApi && Object.keys(e.erros).length > 0) setErrosCampos(e.erros)
      else setErro(e instanceof ErroApi ? e.message : 'Não foi possível salvar a tarefa. Tente de novo.')
    }
  }

  return (
    <Modal titulo={tarefa ? 'Editar tarefa' : 'Nova tarefa'} aoFechar={aoFechar}>
      <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
        {erro && <AvisoErro>{erro}</AvisoErro>}
        <Campo
          rotulo="Título"
          data-autofoco
          required
          maxLength={120}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          erro={errosCampos.titulo}
          placeholder="Ex.: Entregar o relatório do estágio"
        />
        <CampoTexto
          rotulo="Descrição (opcional)"
          maxLength={2000}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          erro={errosCampos.descricao}
        />

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Prioridade</legend>
          <div className="grid grid-cols-3 border-2 border-tinta">
            {PRIORIDADES.map((opcao, i) => (
              <label
                key={opcao.valor}
                className={`relative cursor-pointer text-center font-bold condensado has-checked:bg-tinta has-checked:text-papel has-focus-visible:outline-3 has-focus-visible:outline-pista ${i > 0 ? 'border-l-2 border-tinta' : ''}`}
              >
                <input
                  type="radio"
                  name="prioridade"
                  value={opcao.valor}
                  checked={prioridade === opcao.valor}
                  onChange={() => setPrioridade(opcao.valor)}
                  className="sr-only"
                />
                <span className={`block h-2 ${opcao.faixa}`} aria-hidden="true" />
                <span className="block px-2 py-2.5">{opcao.nome}</span>
              </label>
            ))}
          </div>
          {errosCampos.prioridade && <p className="mt-1.5 text-sm font-semibold text-pista">{errosCampos.prioridade}</p>}
        </fieldset>

        <Campo
          rotulo="Prazo (opcional)"
          type="date"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          erro={errosCampos.prazo}
          className="sm:max-w-60"
        />

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Botao type="button" variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" disabled={salvar.isPending}>
            {salvar.isPending ? 'Salvando…' : tarefa ? 'Salvar alterações' : 'Criar tarefa'}
          </Botao>
        </div>
      </form>
    </Modal>
  )
}
