import { render, screen } from '@testing-library/react'
import { Bib } from './Bib'

describe('número de peito (Bib)', () => {
  it('mostra o número com três dígitos, o título e o prazo', () => {
    render(<Bib numero={7} titulo="Pagar a conta" prioridade="ALTA" status="PENDENTE" prazo="2026-12-05" />)

    expect(screen.getByText('007')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pagar a conta' })).toBeInTheDocument()
    expect(screen.getByText('Prioridade alta')).toBeInTheDocument()
    expect(screen.getByText('Até 5 dez')).toBeInTheDocument()
  })

  it('avisa quando o prazo venceu', () => {
    render(<Bib numero={12} titulo="Treino" prioridade="MEDIA" status="PENDENTE" prazo="2026-11-20" atrasada />)

    expect(screen.getByText('Venceu em 20 nov')).toBeInTheDocument()
  })

  it('tarefa concluída mostra "Concluída" no lugar do prazo', () => {
    render(<Bib numero={3} titulo="Ler" prioridade="BAIXA" status="CONCLUIDA" prazo="2026-11-20" />)

    expect(screen.getByText('Concluída')).toBeInTheDocument()
  })
})
