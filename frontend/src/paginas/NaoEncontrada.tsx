import { BotaoLink, Marca } from '../componentes/ui'

export function NaoEncontrada() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col px-5 py-5 sm:px-8">
      <Marca />
      <main className="flex flex-1 flex-col justify-center py-16">
        <h1 className="titulo text-[clamp(8rem,32vw,26rem)]">404</h1>
        <p className="mt-6 max-w-[32rem] text-xl">Essa página saiu da pista. Confira o endereço ou volte para o início.</p>
        <BotaoLink para="/" className="mt-8 self-start">
          Voltar para o início
        </BotaoLink>
      </main>
    </div>
  )
}
