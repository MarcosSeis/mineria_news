import { render, screen, within } from '@testing-library/react'
import Home, { getStaticProps } from '@/pages/index'
import { fetchList } from '@/lib/api'
import {
  crearPost, crearJob, crearEvento, congelarFecha, descongelarFecha
} from '../../test-utils/fixtures'

jest.mock('@/lib/api')

beforeEach(() => congelarFecha())
afterEach(() => { descongelarFecha(); jest.resetAllMocks() })

const posts = [1, 2, 3, 4, 5, 6, 7].map(n => crearPost(n, `2026-09-${String(10 + n).padStart(2, '0')}T10:00:00`))

describe('Home', () => {
  const montar = (props = {}) => render(<Home jobs={[]} posts={posts} eventos={[]} {...props} />)

  it('muestra las 3 noticias más recientes arriba y las 3 siguientes en "Más Noticias"', () => {
    montar()
    const principales = screen.getByRole('heading', { name: 'Principales noticias' }).closest('section')
    const mas = screen.getByRole('heading', { name: 'Más Noticias' }).closest('section')
    expect(within(principales).getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Noticia 7', 'Noticia 6', 'Noticia 5'])
    expect(within(mas).getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Noticia 4', 'Noticia 3', 'Noticia 2'])
  })

  it('muestra los trabajos recientes (máx. 3) y oculta los de más de 28 días', () => {
    const jobs = [
      crearJob(1, '20261005'), crearJob(2, '20261004'), crearJob(3, '20261003'), crearJob(4, '20261002'),
      crearJob(5, '20250101')
    ]
    montar({ jobs })
    const seccion = screen.getByRole('heading', { name: /Últimos trabajos/ }).closest('section')
    expect(within(seccion).getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Trabajo 1', 'Trabajo 2', 'Trabajo 3'])
    expect(screen.getByRole('button', { name: 'Ver más trabajos' }).closest('a')).toHaveAttribute('href', '/trabajos')
  })

  it('muestra los 3 eventos futuros MÁS PRÓXIMOS ordenados', () => {
    const eventos = [
      crearEvento(1, '20260101'),
      crearEvento(2, '20261220'),
      crearEvento(3, '20261110'),
      crearEvento(4, '20261201'),
      crearEvento(5, '20270101')
    ]
    montar({ eventos })
    const seccion = screen.getByRole('heading', { name: 'Próximos Eventos' }).closest('section')
    expect(within(seccion).getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Evento 3', 'Evento 4', 'Evento 2'])
  })

  it('renderiza anuncios con texto alternativo y sin formulario de boletín', () => {
    montar()
    expect(screen.getByAltText('SEIMPAC')).toBeInTheDocument()
    expect(screen.getByAltText('IEESA')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Suscríbete' })).not.toBeInTheDocument()
  })

  it('no se rompe sin datos (API caída)', () => {
    render(<Home jobs={[]} posts={[]} eventos={[]} />)
    expect(screen.getByRole('heading', { name: 'Principales noticias' })).toBeInTheDocument()
  })
})

describe('getStaticProps (index)', () => {
  it('carga trabajos, noticias y eventos y revalida cada 10 s', async () => {
    fetchList.mockImplementation(async (r) => [r])
    const result = await getStaticProps()
    expect(result).toEqual({ props: { jobs: ['job'], posts: ['noticia'], eventos: ['evento'] }, revalidate: 10 })
  })

  it('devuelve props vacías cuando la API falla', async () => {
    fetchList.mockResolvedValue([])
    const { props } = await getStaticProps()
    expect(props).toEqual({ jobs: [], posts: [], eventos: [] })
  })
})
