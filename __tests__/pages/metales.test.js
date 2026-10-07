import { render, screen } from '@testing-library/react'
import Metales, { getStaticProps } from '@/pages/metales'
import { fetchPrecios } from '@/lib/metales'
import { fetchHistorico } from '@/lib/historico'

jest.mock('@/lib/metales', () => ({ ...jest.requireActual('@/lib/metales'), fetchPrecios: jest.fn() }))

jest.mock('@/lib/historico', () => ({ fetchHistorico: jest.fn() }))

describe('Metales', () => {
  it('muestra una tarjeta por metal', () => {
    const metales = [
      { symbol: 'XAU', nombre: 'Oro', unidad: 'USD / onza troy', precio: 4146.5 },
      { symbol: 'HG', nombre: 'Cobre', unidad: 'USD / libra', precio: 6.56 }
    ]
    render(<Metales metales={metales} />)
    expect(screen.getByRole('heading', { name: 'Precios de metales' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Oro' })).toBeInTheDocument()
    expect(screen.getByText('$6.56')).toBeInTheDocument()
    expect(screen.getByText('USD / libra')).toBeInTheDocument()
  })

  it('muestra un mensaje si no hay datos', () => {
    render(<Metales metales={[]} />)
    expect(screen.getByText(/No pudimos cargar los precios/)).toBeInTheDocument()
  })

  it('getStaticProps revalida cada 5 minutos', async () => {
    fetchPrecios.mockResolvedValue(['m'])
    fetchHistorico.mockResolvedValue({ XAU: [] })
    expect(await getStaticProps()).toEqual({ props: { metales: ['m'], historico: { XAU: [] } }, revalidate: 300 })
  })
})
