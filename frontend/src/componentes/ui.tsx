import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'

const BASE_BOTAO =
  'inline-flex items-center justify-center gap-2 border-2 border-tinta px-6 py-3 text-base font-bold condensado transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const VARIANTES = {
  primario: 'bg-tinta text-papel hover:bg-papel hover:text-tinta',
  secundario: 'bg-papel text-tinta hover:bg-tinta hover:text-papel',
  perigo: 'border-pista bg-papel text-pista hover:bg-pista hover:text-papel',
}

type Variante = keyof typeof VARIANTES

export function Botao({
  variante = 'primario',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button className={`${BASE_BOTAO} ${VARIANTES[variante]} ${className}`} {...props} />
}

export function BotaoLink({
  para,
  variante = 'primario',
  children,
  className = '',
}: {
  para: string
  variante?: Variante
  children: ReactNode
  className?: string
}) {
  return (
    <Link to={para} className={`${BASE_BOTAO} ${VARIANTES[variante]} ${className}`}>
      {children}
    </Link>
  )
}

type PropsCampo = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string
  erro?: string
  dica?: string
}

/** Campo com rótulo, dica e mensagem de erro ligados ao input para leitores de tela. */
export function Campo({ rotulo, erro, dica, className = '', ...props }: PropsCampo) {
  const id = useId()
  const idAjuda = `${id}-ajuda`
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {rotulo}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro || dica ? idAjuda : undefined}
        className={`w-full border-2 bg-papel px-3.5 py-3 text-base outline-none placeholder:text-grafite/70 focus:border-tinta focus-visible:outline-3 focus-visible:outline-offset-2 ${erro ? 'border-pista' : 'border-tinta'}`}
        {...props}
      />
      {(erro || dica) && (
        <p id={idAjuda} className={`mt-1.5 text-sm ${erro ? 'font-semibold text-pista' : 'text-grafite'}`}>
          {erro ?? dica}
        </p>
      )}
    </div>
  )
}

/** Aviso de erro geral de um formulário (credenciais erradas, servidor fora do ar...). */
export function AvisoErro({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="border-2 border-pista bg-pista/8 px-4 py-3 text-sm font-semibold text-pista">
      {children}
    </p>
  )
}

export function Marca({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`titulo text-3xl leading-none tracking-tight ${className}`} aria-label="Tarefas, página inicial">
      Tarefas
    </Link>
  )
}
