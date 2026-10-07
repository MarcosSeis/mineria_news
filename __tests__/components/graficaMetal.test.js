import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GraficaMetal from '@/components/graficaMetal'

const serie = (base, n) => Array.from({ length: n }, (_, i) => ({
  fecha: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`, precio: base + i
}))
const metales = [
  { symbol: 'XAU', nombre: 'Oro', unidad: 'USD / onza troy', serie: serie(4000, 80) },
  { symbol: 'HG', nombre: 'Cobre', unidad: 'USD / libra', serie: serie(6, 80) },
  { symbol: 'XAG', nombre: 'Plata', unidad: 'USD / onza troy', serie: [] }
]

describe('GraficaMetal', () => {
  it('no renderiza nada sin datos', () => {
    const { container } = render(<GraficaMetal metales={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('ofrece solo los metales con histórico y muestra el primero', () => {
    render(<GraficaMetal metales={metales} />)
    expect(screen.getByRole('button', { name: 'Oro' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Cobre' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Plata' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Gráfica de precio de Oro/ })).toBeInTheDocument()
  })

  it('cambia de metal', async () => {
    render(<GraficaMetal metales={metales} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cobre' }))
    expect(screen.getByRole('img', { name: /Cobre/ })).toBeInTheDocument()
    expect(screen.getByText(/Cobre:/)).toHaveTextContent('$85.00')
  })

  it('el rango de 1 mes recorta la serie y muestra la variación', async () => {
    render(<GraficaMetal metales={metales} />)
    expect(screen.getByText(/▲ 0.5% en el periodo/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '3 meses' }))
    expect(screen.getByText(/▲ 1.6% en el periodo/)).toBeInTheDocument()
  })
})
