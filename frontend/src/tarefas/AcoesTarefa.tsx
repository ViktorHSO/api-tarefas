import { useEffect, useState } from 'react'
import type { Tarefa } from '../api/tarefas'
import type { Status } from '../componentes/Bib'
import { useAlterarStatus, useExcluirTarefa } from './consultas'

/** O próximo passo natural de cada status. */
const PROXIMO: Record<Status, { status: Status; nome: string; aviso: string }> = {
  PENDENTE: { status: 'EM_ANDAMENTO', nome: 'Começar', aviso: 'Tarefa em andamento.' },
  EM_ANDAMENTO: { status: 'CONCLUIDA', nome: 'Concluir', aviso: 'Tarefa concluída.' },
  CONCLUIDA: { status: 'PENDENTE', nome: 'Reabrir', aviso: 'Tarefa reaberta.' },
}

type Props = {
  tarefa: Tarefa
  aoEditar: () => void
  aoAvisar: (mensagem: string) => void
}

export function AcoesTarefa({ tarefa, aoEditar, aoAvisar }: Props) {
  const alterar = useAlterarStatus()
  const excluir = useExcluirTarefa()
  const [confirmando, setConfirmando] = useState(false)
  const proximo = PROXIMO[tarefa.status]

  // O pedido de confirmação some sozinho se a pessoa não confirmar.
  useEffect(() => {
    if (!confirmando) return
    const espera = setTimeout(() => setConfirmando(false), 4000)
    return () => clearTimeout(espera)
  }, [confirmando])

  async function avancar() {
    try {
      await alterar.mutateAsync({ id: tarefa.id, status: proximo.status })
      aoAvisar(proximo.aviso)
    } catch {
      aoAvisar('Não foi possível mudar o status. Tente de novo.')
    }
  }

  async function confirmarExclusao() {
    try {
      await excluir.mutateAsync(tarefa.id)
      aoAvisar('Tarefa excluída.')
    } catch {
      aoAvisar('Não foi possível excluir. Tente de novo.')
      setConfirmando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={avancar}
        disabled={alterar.isPending}
        className="condensado w-full border-2 border-tinta bg-papel py-2.5 font-bold hover:bg-tinta hover:text-papel disabled:opacity-50"
      >
        {proximo.nome}
        <span className="sr-only">: {tarefa.titulo}</span>
      </button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={aoEditar} className="font-semibold underline-offset-4 hover:underline">
          Editar<span className="sr-only">: {tarefa.titulo}</span>
        </button>
        {confirmando ? (
          <button type="button" onClick={confirmarExclusao} disabled={excluir.isPending} className="font-bold text-pista underline underline-offset-4">
            Confirmar exclusão
          </button>
        ) : (
          <button type="button" onClick={() => setConfirmando(true)} className="font-semibold text-grafite underline-offset-4 hover:text-pista hover:underline">
            Excluir<span className="sr-only">: {tarefa.titulo}</span>
          </button>
        )}
      </div>
    </div>
  )
}
