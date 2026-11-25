import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/contexto'
import { Marca } from '../componentes/ui'

const LINKS = [{ para: '/tarefas', nome: 'Tarefas' }]

/** Estrutura da área logada: cabeçalho fixo com navegação e o conteúdo da página. */
export function LayoutApp() {
  const { sessao, sair } = useAuth()

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b-2 border-tinta bg-papel">
        <div className="mx-auto flex max-w-[90rem] items-center gap-8 px-5 py-4 sm:px-8">
          <Marca />
          <nav className="flex gap-6" aria-label="Principal">
            {LINKS.map((link) => (
              <NavLink
                key={link.para}
                to={link.para}
                className={({ isActive }) =>
                  `border-b-[3px] pb-0.5 font-semibold ${isActive ? 'border-tinta' : 'border-transparent text-grafite hover:text-tinta'}`
                }
              >
                {link.nome}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-5">
            {sessao?.nome && <span className="hidden text-grafite sm:inline">{sessao.nome}</span>}
            <button type="button" onClick={sair} className="font-semibold underline-offset-4 hover:underline">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8 lg:py-14">
        <Outlet />
      </main>
    </div>
  )
}
