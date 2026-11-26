import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
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

const BASE_CAMPO =
  'w-full border-2 bg-papel px-3.5 py-3 text-base outline-none placeholder:text-grafite/70 focus:border-tinta focus-visible:outline-3 focus-visible:outline-offset-2'

type PropsCampo = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string
  erro?: string
  dica?: string
}

/**
 * Campo com rótulo, dica e mensagem de erro ligados ao input para leitores de tela.
 * Campos de senha ganham um botão para mostrar e esconder o que foi digitado.
 */
export function Campo({ rotulo, erro, dica, className = '', type, ...props }: PropsCampo) {
  const id = useId()
  const idAjuda = `${id}-ajuda`
  const senha = type === 'password'
  const [mostrar, setMostrar] = useState(false)
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {rotulo}
      </label>
      <div className="relative">
        <input
          id={id}
          type={senha && mostrar ? 'text' : type}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro || dica ? idAjuda : undefined}
          className={`${BASE_CAMPO} ${senha ? 'pr-24' : ''} ${erro ? 'border-pista' : 'border-tinta'}`}
          {...props}
        />
        {senha && (
          <button
            type="button"
            onClick={() => setMostrar((m) => !m)}
            aria-pressed={mostrar}
            aria-label={`${mostrar ? 'Esconder' : 'Mostrar'} ${rotulo.toLowerCase()}`}
            className="absolute inset-y-0 right-0 px-4 text-sm font-semibold underline-offset-4 hover:underline"
          >
            {mostrar ? 'Esconder' : 'Mostrar'}
          </button>
        )}
      </div>
      {(erro || dica) && (
        <p id={idAjuda} className={`mt-1.5 text-sm ${erro ? 'font-semibold text-pista' : 'text-grafite'}`}>
          {erro ?? dica}
        </p>
      )}
    </div>
  )
}

type PropsCampoTexto = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  rotulo: string
  erro?: string
  dica?: string
}

/** Versão de várias linhas do Campo (descrição da tarefa). */
export function CampoTexto({ rotulo, erro, dica, className = '', ...props }: PropsCampoTexto) {
  const id = useId()
  const idAjuda = `${id}-ajuda`
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {rotulo}
      </label>
      <textarea
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro || dica ? idAjuda : undefined}
        className={`${BASE_CAMPO} min-h-28 resize-y ${erro ? 'border-pista' : 'border-tinta'}`}
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

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Janela modal acessível: prende o foco dentro dela, fecha com Esc ou clicando fora
 * e devolve o foco para quem a abriu.
 */
export function Modal({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: ReactNode }) {
  const idTitulo = useId()
  const caixa = useRef<HTMLDivElement>(null)
  const fechar = useEffectEvent(aoFechar)

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    const primeiro = caixa.current?.querySelector<HTMLElement>('[data-autofoco]') ?? caixa.current?.querySelector<HTMLElement>(FOCAVEIS)
    primeiro?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function teclado(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        fechar()
        return
      }
      if (e.key !== 'Tab' || !caixa.current) return
      const focaveis = Array.from(caixa.current.querySelectorAll<HTMLElement>(FOCAVEIS))
      if (focaveis.length === 0) return
      const [inicio, fim] = [focaveis[0], focaveis[focaveis.length - 1]]
      if (e.shiftKey && document.activeElement === inicio) {
        e.preventDefault()
        fim.focus()
      } else if (!e.shiftKey && document.activeElement === fim) {
        e.preventDefault()
        inicio.focus()
      }
    }

    document.addEventListener('keydown', teclado)
    return () => {
      document.removeEventListener('keydown', teclado)
      document.body.style.overflow = overflow
      anterior?.focus()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/55 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="max-h-[92dvh] w-full max-w-[34rem] overflow-y-auto border-2 border-tinta bg-papel"
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-tinta px-6 py-5">
          <h2 id={idTitulo} className="titulo text-5xl">
            {titulo}
          </h2>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="-mr-1 -mt-1 p-1 text-3xl leading-none">
            ×
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
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
