type Props = {
  pagina: number
  totalPaginas: number
  aoMudar: (pagina: number) => void
}

export function Paginacao({ pagina, totalPaginas, aoMudar }: Props) {
  if (totalPaginas <= 1) return null
  return (
    <nav aria-label="Páginas" className="mt-10 flex items-center justify-between border-t-2 border-tinta pt-4">
      <button
        type="button"
        onClick={() => aoMudar(pagina - 1)}
        disabled={pagina === 0}
        className="font-semibold underline-offset-4 hover:underline disabled:text-grafite/50 disabled:no-underline"
      >
        Anteriores
      </button>
      <p className="text-grafite" aria-live="polite">
        Página {pagina + 1} de {totalPaginas}
      </p>
      <button
        type="button"
        onClick={() => aoMudar(pagina + 1)}
        disabled={pagina + 1 >= totalPaginas}
        className="font-semibold underline-offset-4 hover:underline disabled:text-grafite/50 disabled:no-underline"
      >
        Próximas
      </button>
    </nav>
  )
}
