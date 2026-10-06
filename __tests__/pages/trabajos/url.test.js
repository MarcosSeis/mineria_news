import { render, screen } from '@testing-library/react'
import Trabajo, { getStaticProps, getStaticPaths } from '@/pages/trabajos/[url]'
import { fetchBySlug } from '@/lib/api'
import { crearJob, congelarFecha, descongelarFecha } from '../../../test-utils/fixtures'

jest.mock('@/lib/api')
beforeEach(() => congelarFecha())
afterEach(() => { descongelarFecha(); jest.resetAllMocks() })

describe('Detalle de trabajo', () => {
  it('muestra los datos de la oferta y los botones', () => {
    render(<Trabajo job={crearJob(1, '20261001')} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Trabajo 1' })).toBeInTheDocument()
    expect(screen.getByText('Hace 5 días')).toBeInTheDocument()
    expect(screen.getByText('Requisitos 1')).toBeInTheDocument()
    expect(screen.getByText('Ubicacion: Zacatecas')).toBeInTheDocument()
    const oferta = screen.getByRole('button', { name: 'Ir a Oferta' }).closest('a')
    expect(oferta).toHaveAttribute('href', 'https://empresa.test/oferta')
    expect(oferta).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('button', { name: 'Volver a ofertas' }).closest('a')).toHaveAttribute('href', '/trabajos')
  })

  it('acepta fechas con hora (YYYYMMDD HH:mm:ss) sin romperse', () => {
    render(<Trabajo job={crearJob(1, '20261001', { fecha: '20261001 10:30:00' })} />)
    expect(screen.getByText('Hace 5 días')).toBeInTheDocument()
  })

  it('oculta el botón de oferta si el enlace es inseguro', () => {
    render(<Trabajo job={crearJob(1, '20261001', { link: 'javascript:alert(1)' })} />)
    expect(screen.queryByRole('button', { name: 'Ir a Oferta' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver a ofertas' })).toBeInTheDocument()
  })

  it('getStaticPaths genera bajo demanda', async () => {
    expect(await getStaticPaths()).toEqual({ paths: [], fallback: 'blocking' })
  })

  it('getStaticProps devuelve la oferta por slug', async () => {
    const job = crearJob(1, '20261001')
    fetchBySlug.mockResolvedValue(job)
    expect(await getStaticProps({ params: { url: 'trabajo-1' } })).toEqual({ props: { job }, revalidate: 60 })
    expect(fetchBySlug).toHaveBeenCalledWith('job', 'trabajo-1')
  })

  it.each([[null], [{ id: 1 }]])('responde notFound cuando el resultado es %p', async (resultado) => {
    fetchBySlug.mockResolvedValue(resultado)
    expect(await getStaticProps({ params: { url: 'x' } })).toEqual({ notFound: true, revalidate: 10 })
  })
})
