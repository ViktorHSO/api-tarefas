import type { ReactNode } from 'react'
import { Marca } from '../componentes/ui'

/** Página de login/cadastro: o título ocupa metade da tela, o formulário a outra. */
export function LayoutAuth({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col justify-between border-b-2 border-tinta px-5 py-5 sm:px-8 lg:border-b-0 lg:border-r-2 lg:py-8">
        <Marca />
        <h1 className="titulo mt-16 text-[clamp(5rem,15vw,13rem)] lg:mt-0">{titulo}</h1>
      </div>
      <main className="flex items-center px-5 py-12 sm:px-8 lg:px-16">
        <div className="w-full max-w-[26rem]">{children}</div>
      </main>
    </div>
  )
}
