import { render, screen } from '@testing-library/react'
import Job from '@/components/job'
import { crearJob, congelarFecha, descongelarFecha } from '../../test-utils/fixtures'

beforeEach(() => congelarFecha())
afterEach(() => descongelarFecha())

describe('Job', () => {
  it('muestra los datos de la oferta y enlaza al detalle', () => {
    const job = crearJob(1, '20261001')
    render(<Job job={job.acf} id={job.slug} />)
    expect(screen.getByRole('heading', { name: 'Trabajo 1' })).toBeInTheDocument()
    expect(screen.getByText('$30,000')).toBeInTheDocument()
    expect(screen.getByText('Empresa 1')).toBeInTheDocument()
    expect(screen.getByText('Zacatecas')).toBeInTheDocument()
    expect(screen.getByText('Hace 5 días')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/trabajos/trabajo-1')
  })

  it.each([['20261006', 'Hoy'], ['20261005', 'Hace 1 día']])('fecha %s -> %s', (fecha, texto) => {
    render(<Job job={crearJob(1, fecha).acf} id="x" />)
    expect(screen.getByText(texto)).toBeInTheDocument()
  })

  it('no usa <main> (solo puede haber uno por página) ni oculta con clases globales', () => {
    render(<Job job={crearJob(1, '20260101').acf} id="x" />)
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('link').className).not.toMatch(/ocultar/)
  })

  it('no muestra "NaN" con fecha inválida', () => {
    render(<Job job={crearJob(1, '20261001', { fecha: 'mala' }).acf} id="x" />)
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
  })
})
