import { render, screen } from '@testing-library/react'
import Noticia, { getStaticProps, getStaticPaths } from '@/pages/noticias/[url]'
import { fetchBySlug } from '@/lib/api'
import { crearPost } from '../../../test-utils/fixtures'

jest.mock('@/lib/api')
afterEach(() => jest.resetAllMocks())

describe('Detalle de noticia', () => {
  it('muestra título (h1), fecha, texto e imagen y define la description', () => {
    const post = crearPost(1, '2026-10-01T10:00:00', { contenido: 'Texto completo de la noticia' })
    const { container } = render(<Noticia post={post} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Noticia 1' })).toBeInTheDocument()
    expect(screen.getByText(/01 de octubre de 2026/)).toBeInTheDocument()
    expect(screen.getByText('Texto completo de la noticia')).toBeInTheDocument()
    expect(screen.getByAltText('Imagen Noticia 1')).toBeInTheDocument()
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Texto completo de la noticia')
  })

  it('recorta la description a 160 caracteres y funciona sin imagen', () => {
    const post = crearPost(1, '2026-10-01', { contenido: 'x'.repeat(300), imagen: '' })
    const { container } = render(<Noticia post={post} />)
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toHaveLength(160)
    expect(screen.queryByAltText('Imagen Noticia 1')).not.toBeInTheDocument()
  })

  it('getStaticPaths genera bajo demanda (fallback blocking)', async () => {
    expect(await getStaticPaths()).toEqual({ paths: [], fallback: 'blocking' })
  })

  it('getStaticProps devuelve la noticia por slug', async () => {
    const post = crearPost(1)
    fetchBySlug.mockResolvedValue(post)
    expect(await getStaticProps({ params: { url: 'noticia-1' } })).toEqual({ props: { post }, revalidate: 60 })
    expect(fetchBySlug).toHaveBeenCalledWith('noticia', 'noticia-1')
  })

  it.each([[null], [{ id: 1 }]])('responde 404 (notFound) en vez de un 500 cuando el resultado es %p', async (resultado) => {
    fetchBySlug.mockResolvedValue(resultado)
    expect(await getStaticProps({ params: { url: 'no-existe' } })).toEqual({ notFound: true, revalidate: 10 })
  })
})
