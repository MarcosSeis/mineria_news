import { render, screen, within } from '@testing-library/react'
import Trabajos, { getStaticProps } from '@/pages/trabajos'
import { fetchList } from '@/lib/api'
import { crearJob, congelarFecha, descongelarFecha } from '../../test-utils/fixtures'

jest.mock('@/lib/api')
beforeEach(() => congelarFecha())
afterEach(() => { descongelarFecha(); jest.resetAllMocks() })

describe('Trabajos', () => {
  it('muestra solo ofertas recientes, ordenadas de más nueva a más antigua', () => {
    const jobs = [crearJob(1, '20260920'), crearJob(2, '20261005'), crearJob(3, '20240101')]
    render(<Trabajos jobs={jobs} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Bolsa de Trabajo' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Trabajo 2', 'Trabajo 1'])
  })

  it('tiene un solo <main> aunque haya varias ofertas', () => {
    render(<Trabajos jobs={[crearJob(1, '20261005'), crearJob(2, '20261004')]} />)
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('getStaticProps usa la API y revalida', async () => {
    fetchList.mockResolvedValue([{ id: 1 }])
    expect(await getStaticProps()).toEqual({ props: { jobs: [{ id: 1 }] }, revalidate: 10 })
    expect(fetchList).toHaveBeenCalledWith('job')
  })
})
