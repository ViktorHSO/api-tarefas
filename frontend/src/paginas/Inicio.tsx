import { Link } from 'react-router'
import { Bib } from '../componentes/Bib'
import { LinhaDeChegada, PistaDeAtletismo } from '../componentes/Ilustracoes'
import { BotaoLink, Marca } from '../componentes/ui'

const LINHAS = ['Termine', 'o que você', 'começou.']

/** Prazo relativo a hoje, para os exemplos sempre fazerem sentido. */
function diasAPartirDeHoje(dias: number) {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  return [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')].join('-')
}

export function Inicio() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-5 sm:px-8">
        <Marca />
        <nav className="flex items-center gap-5">
          <Link to="/entrar" className="font-semibold underline-offset-4 hover:underline">
            Entrar
          </Link>
          <BotaoLink para="/criar-conta" className="px-4 py-2">
            Criar conta
          </BotaoLink>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          {/* A pista fica atrás do título e se move mais devagar que a página ao rolar (paralaxe). */}
          <div aria-hidden="true" className="paralaxe pointer-events-none absolute inset-0 -z-10 [--velocidade:0.45]">
            <PistaDeAtletismo className="absolute -right-[18rem] top-6 w-[72rem] max-w-none text-concreto sm:-right-40 lg:right-[-6rem] lg:top-0 lg:w-[88rem]" />
          </div>
          <div className="mx-auto max-w-[90rem] px-5 pb-16 pt-6 sm:px-8 lg:pb-24">
            <h1 className="titulo text-[clamp(4rem,20.5vw,19.5rem)]">
              {LINHAS.map((linha, i) => (
                <span key={linha} className="linha-revelada">
                  <span style={{ animationDelay: `${i * 90}ms` }}>{linha}</span>
                </span>
              ))}
            </h1>

            <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1fr_auto] lg:items-end">
              <p className="max-w-[38rem] text-xl leading-8 sm:text-2xl sm:leading-9">
                Organize suas tarefas por prioridade e prazo, veja na hora o que atrasou e acompanhe o que já cruzou a linha
                de chegada.
              </p>
              <div className="flex flex-wrap gap-3">
                <BotaoLink para="/criar-conta" className="px-8 py-4 text-lg">
                  Criar conta grátis
                </BotaoLink>
                <BotaoLink para="/entrar" variante="secundario" className="px-8 py-4 text-lg">
                  Já tenho conta
                </BotaoLink>
              </div>
            </div>
          </div>
        </section>

        <LinhaDeChegada className="text-tinta" />
        <section className="border-b-2 border-tinta bg-concreto">
          <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:py-24">
            <div>
              <h2 className="titulo text-[clamp(3.5rem,7vw,6rem)]">Cada tarefa ganha um número</h2>
              <p className="mt-6 max-w-[32rem] text-lg leading-8">
                A faixa do topo mostra a prioridade. O prazo fica no rodapé e avisa quando atrasou. Terminou? O número fica
                vazado, como quem já guardou o peito de corrida na gaveta.
              </p>
            </div>

            <ul className="grid gap-6 sm:grid-cols-3 sm:gap-5" aria-label="Exemplos de tarefas">
              {/* Cada número de peito rola numa velocidade diferente (paralaxe). */}
              <li className="sm:-rotate-2 sm:translate-y-6">
                <div className="paralaxe [--velocidade:0.5]">
                  <Bib numero={27} titulo="Entregar o relatório do estágio" prioridade="ALTA" status="PENDENTE" prazo={diasAPartirDeHoje(3)} />
                </div>
              </li>
              <li className="sm:rotate-1">
                <div className="paralaxe [--velocidade:-0.35]">
                  <Bib numero={114} titulo="Treino de corrida, 8 km" prioridade="MEDIA" status="EM_ANDAMENTO" prazo={diasAPartirDeHoje(-2)} atrasada />
                </div>
              </li>
              <li className="sm:-rotate-1 sm:translate-y-10">
                <div className="paralaxe [--velocidade:0.9]">
                  <Bib numero={9} titulo="Renovar a carteira de motorista" prioridade="BAIXA" status="CONCLUIDA" />
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-grafite sm:px-8">
        <p>Projeto de portfólio de Victor Hugo Sousa Oliveira.</p>
        <a href="https://github.com/ViktorHSO/api-tarefas" className="font-semibold text-tinta underline-offset-4 hover:underline">
          Código no GitHub
        </a>
      </footer>
    </div>
  )
}
