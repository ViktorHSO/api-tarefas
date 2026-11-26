import { useId, type SVGProps } from 'react'

/*
  Ilustrações e ícones em SVG, desenhados no próprio código.
  Todos usam currentColor: a cor vem do texto em volta (text-tinta, text-pista...),
  então seguem o tema sem arquivo de imagem nenhum.
*/

type PropsSvg = SVGProps<SVGSVGElement>

const RAIAS = 6

/**
 * Curva de uma pista de atletismo: as raias vêm em linha reta e fazem a volta.
 * Decorativa (aria-hidden): fica atrás do título da página inicial.
 */
export function PistaDeAtletismo({ className = '', ...props }: PropsSvg) {
  const centroX = 860
  const centroY = 400
  const raioInterno = 150
  const largura = 44

  return (
    <svg viewBox="0 0 1400 800" fill="none" aria-hidden="true" focusable="false" className={className} {...props}>
      {Array.from({ length: RAIAS + 1 }, (_, i) => {
        const raio = raioInterno + i * largura
        const cima = centroY - raio
        const baixo = centroY + raio
        return (
          <path
            key={i}
            d={`M 0 ${cima} H ${centroX} A ${raio} ${raio} 0 0 1 ${centroX} ${baixo} H 0`}
            stroke="currentColor"
            strokeWidth={i === 0 || i === RAIAS ? 4 : 2}
          />
        )
      })}
      {/* Número de cada raia pintado no chão, na reta de baixo. */}
      {Array.from({ length: RAIAS }, (_, i) => {
        const raio = raioInterno + i * largura + largura / 2
        return (
          <text
            key={i}
            x={120}
            y={centroY + raio + 12}
            fill="currentColor"
            fontSize={30}
            fontWeight={900}
            style={{ fontStretch: '62%' }}
          >
            {i + 1}
          </text>
        )
      })}
      {/* Linha de largada atravessando as raias. */}
      <line x1={220} y1={centroY + raioInterno} x2={220} y2={centroY + raioInterno + RAIAS * largura} stroke="currentColor" strokeWidth={8} />
    </svg>
  )
}

/** Faixa quadriculada de linha de chegada. Ocupa toda a largura disponível. */
export function LinhaDeChegada({ className = '', ...props }: PropsSvg) {
  const idPadrao = useId()
  return (
    <svg aria-hidden="true" focusable="false" className={`block h-6 w-full ${className}`} {...props}>
      <defs>
        <pattern id={idPadrao} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="currentColor" />
          <rect x="12" y="12" width="12" height="12" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${idPadrao})`} />
    </svg>
  )
}

/** Base dos ícones: 24×24, traço reto e grosso, como o resto da identidade. */
function Icone({ children, className = '', ...props }: PropsSvg) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={`size-5 shrink-0 ${className}`}
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconeMais(props: PropsSvg) {
  return (
    <Icone {...props}>
      <path d="M12 4v16M4 12h16" />
    </Icone>
  )
}

export function IconeBusca(props: PropsSvg) {
  return (
    <Icone {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </Icone>
  )
}

/** Bandeira quadriculada: usada quando não há nada na pista. */
export function IconeBandeira(props: PropsSvg) {
  return (
    <Icone {...props}>
      <path d="M5 21V3" />
      <path d="M5 4h14v10H5" />
      <g fill="currentColor" stroke="none">
        <rect x="5" y="4" width="4.67" height="5" />
        <rect x="14.33" y="4" width="4.67" height="5" />
        <rect x="9.67" y="9" width="4.66" height="5" />
      </g>
    </Icone>
  )
}
