import { render } from '@testing-library/react'
import { IconeBusca, IconeMais, LinhaDeChegada, PistaDeAtletismo } from './Ilustracoes'

describe('ilustrações em SVG', () => {
  it('são decorativas: ficam escondidas dos leitores de tela', () => {
    const { container } = render(
      <>
        <PistaDeAtletismo />
        <LinhaDeChegada />
        <IconeMais />
        <IconeBusca />
      </>,
    )

    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(4)
    svgs.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'))
  })

  it('a pista desenha uma linha a mais que o número de raias e numera as 6 raias', () => {
    const { container } = render(<PistaDeAtletismo />)

    expect(container.querySelectorAll('path')).toHaveLength(7)
    expect(Array.from(container.querySelectorAll('text'), (t) => t.textContent)).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('cada linha de chegada usa o próprio padrão quadriculado', () => {
    const { container } = render(
      <>
        <LinhaDeChegada />
        <LinhaDeChegada />
      </>,
    )

    const ids = Array.from(container.querySelectorAll('pattern'), (p) => p.id)
    expect(new Set(ids).size).toBe(2)
    container.querySelectorAll('rect[fill^="url"]').forEach((rect, i) => expect(rect.getAttribute('fill')).toBe(`url(#${ids[i]})`))
  })
})
