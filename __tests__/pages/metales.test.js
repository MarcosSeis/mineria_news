import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import Metales, { getStaticProps } from '@/pages/metales'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))

const serie = (base) => Array.from({ length: 5 }, (_, i) => ({ fecha: `2026-10-0${i + 1}`, precio: base + i }))

describe('Metales', () => {
  beforeEach(() => useRouter.mockReturnValue({ query: {} }))

  it('muestra una tarjeta por metal y la gráfica', () => {
    const metales = [
      { symbol: 'XAU', nombre: 'Oro', unidad: 'USD / onza troy', precio: 4146.5, serie: serie(4000) },
      { symbol: 'HG', nombre: 'Cobre', unidad: 'USD / libra', precio: 6.56, serie: serie(6) }
    ]
    render(<Metales metales={metales} />)
    expect(screen.getByRole('heading', { name: 'Precios de metales' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Oro' })).toBeInTheDocument()
    expect(screen.getByText('$6.56')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Gráfica de precio de Oro/ })).toBeInTheDocument()
  })

  it('abre la gráfica en el metal indicado en la URL', () => {
    useRouter.mockReturnValue({ query: { metal: 'HG' } })
    const metales = [
      { symbol: 'XAU', nombre: 'Oro', unidad: 'USD / onza troy', precio: 4146.5, serie: serie(4000) },
      { symbol: 'HG', nombre: 'Cobre', unidad: 'USD / libra', precio: 6.56, serie: serie(6) }
    ]
    render(<Metales metales={metales} />)
    expect(screen.getByRole('img', { name: /Gráfica de precio de Cobre/ })).toBeInTheDocument()
  })

  it('muestra un mensaje si no hay datos', () => {
    render(<Metales metales={[]} />)
    expect(screen.getByText(/No pudimos cargar los precios/)).toBeInTheDocument()
  })

  it('getStaticProps lee los datos guardados con su histórico', () => {
    const { props } = getStaticProps()
    expect(props.metales.length).toBeGreaterThan(0)
    expect(props.metales[0].serie.length).toBeGreaterThan(1)
  })
})
