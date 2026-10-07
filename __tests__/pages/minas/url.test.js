import { render, screen } from '@testing-library/react'
import FichaMina, { getStaticProps, getStaticPaths } from '@/pages/minas/[url]'
import { fetchBySlug } from '@/lib/api'
import { crearMina } from '../../../test-utils/fixtures'

jest.mock('@/lib/api')
afterEach(() => jest.resetAllMocks())

describe('Ficha de mina', () => {
  it('muestra los datos y los botones', () => {
    render(<FichaMina mina={crearMina(1)} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Mina 1' })).toBeInTheDocument()
    expect(screen.getByText('Oro, Plata')).toBeInTheDocument()
    expect(screen.getByText('Subterránea')).toBeInTheDocument()
    expect(screen.getByText('Descripción 1')).toBeInTheDocument()
    expect(screen.getByAltText('Imagen de Mina 1')).toBeInTheDocument()
    const sitio = screen.getByRole('button', { name: 'Sitio web' }).closest('a')
    expect(sitio).toHaveAttribute('href', 'https://mina1.test/')
    expect(sitio).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('button', { name: 'Volver al directorio' }).closest('a')).toHaveAttribute('href', '/minas')
  })

  it('omite lo que falta: sin imagen, sin sitio y sin campos vacíos', () => {
    render(<FichaMina mina={crearMina(1, { imagen: '', sitio_web: '', empresa: '', descripcion: '' })} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sitio web' })).not.toBeInTheDocument()
    expect(screen.queryByText('Empresa')).not.toBeInTheDocument()
  })

  it('oculta el sitio web si el enlace es inseguro', () => {
    render(<FichaMina mina={crearMina(1, { sitio_web: 'javascript:alert(1)' })} />)
    expect(screen.queryByRole('button', { name: 'Sitio web' })).not.toBeInTheDocument()
  })

  it('getStaticPaths genera bajo demanda', async () => {
    expect(await getStaticPaths()).toEqual({ paths: [], fallback: 'blocking' })
  })

  it('getStaticProps devuelve la mina o notFound', async () => {
    fetchBySlug.mockResolvedValueOnce(crearMina(1))
    expect((await getStaticProps({ params: { url: 'mina-1' } })).props.mina.slug).toBe('mina-1')
    expect(fetchBySlug).toHaveBeenCalledWith('mina', 'mina-1')
    fetchBySlug.mockResolvedValueOnce(null)
    expect(await getStaticProps({ params: { url: 'x' } })).toMatchObject({ notFound: true })
  })
})
