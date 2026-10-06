import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Meses, { MESES } from '@/components/meses'
import { crearEvento, congelarFecha, descongelarFecha } from '../../test-utils/fixtures'

const eventos = [
  crearEvento(1, '20261012'),
  crearEvento(2, '20260115'),
  crearEvento(3, '20251020'),
  crearEvento(4, 'mala')
]

beforeEach(() => congelarFecha())
afterEach(() => descongelarFecha())

describe('Meses', () => {
  it('define los 12 meses en orden', () => {
    expect(MESES).toHaveLength(12)
    expect(MESES[0]).toEqual({ mes: 'Enero', id: 0 })
    expect(MESES[11]).toEqual({ mes: 'Diciembre', id: 11 })
  })

  it('inicia en el mes actual y muestra solo sus eventos del año', () => {
    render(<Meses year={2026} eventos={eventos} />)
    expect(screen.getByRole('heading', { name: 'Octubre, 2026' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Octubre' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('Evento 1').length).toBeGreaterThan(0)
    // octubre de 2025 no debe mezclarse con octubre de 2026
    expect(screen.queryByText('Evento 3')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Eventos' })).toBeInTheDocument()
  })

  it('Enero (id 0) sí filtra sus eventos', async () => {
    render(<Meses year={2026} eventos={eventos} />)
    await userEvent.click(screen.getByRole('button', { name: 'Enero' }))
    expect(screen.getByRole('heading', { name: 'Enero, 2026' })).toBeInTheDocument()
    expect(screen.getAllByText('Evento 2').length).toBeGreaterThan(0)
    expect(screen.queryByText('Evento 1')).not.toBeInTheDocument()
  })

  it('avisa cuando no hay eventos en el mes', async () => {
    render(<Meses year={2026} eventos={eventos} />)
    await userEvent.click(screen.getByRole('button', { name: 'Marzo' }))
    expect(screen.getByRole('heading', { name: 'No hay eventos este mes' })).toBeInTheDocument()
  })

  it('funciona sin eventos', () => {
    render(<Meses year={2026} eventos={[]} />)
    expect(screen.getByRole('heading', { name: 'No hay eventos este mes' })).toBeInTheDocument()
  })
})
