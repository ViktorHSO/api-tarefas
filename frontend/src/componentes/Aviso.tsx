import { useCallback, useEffect, useState } from 'react'

/** Confirmação curta das ações ("Tarefa criada."), anunciada também para leitores de tela. */
export function useAviso() {
  const [mensagem, setMensagem] = useState<{ texto: string; chave: number } | null>(null)

  useEffect(() => {
    if (!mensagem) return
    const espera = setTimeout(() => setMensagem(null), 3200)
    return () => clearTimeout(espera)
  }, [mensagem])

  const avisar = useCallback((texto: string) => setMensagem({ texto, chave: Date.now() }), [])

  const elemento = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-5">
      {mensagem && (
        <p key={mensagem.chave} className="animate-[entrar-aviso_200ms_ease-out] border-2 border-tinta bg-tinta px-5 py-3 font-semibold text-papel">
          {mensagem.texto}
        </p>
      )}
    </div>
  )

  return { avisar, elemento }
}
