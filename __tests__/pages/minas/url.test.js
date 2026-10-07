import { render, screen } from '@testing-library/react'
import FichaMina, { getStaticProps, getStaticPaths } from '@/pages/minas/[url]'
import { leerMinas } from '@/lib/minas'
import { crearMina } from '../../../test-utils/fixtures'


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

  it('muestra el contacto de la empresa con enlaces tel: y mailto:', () => {
    render(<FichaMina mina={crearMina(1, { telefono: '+52 55 5836 8200', correo: 'info@empresa.test', direccion: 'Calle 1, CDMX' })} />)
    expect(screen.getByRole('heading', { name: 'Contacto de la empresa' })).toBeInTheDocument()
    expect(screen.getByText('Calle 1, CDMX')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '+52 55 5836 8200' })).toHaveAttribute('href', 'tel:+525558368200')
    expect(screen.getByRole('link', { name: 'info@empresa.test' })).toHaveAttribute('href', 'mailto:info@empresa.test')
  })

  it('omite la sección de contacto si no hay datos o el correo es inválido', () => {
    const { unmount } = render(<FichaMina mina={crearMina(1)} />)
    expect(screen.queryByRole('heading', { name: 'Contacto de la empresa' })).not.toBeInTheDocument()
    unmount()
    render(<FichaMina mina={crearMina(1, { correo: 'no-es-correo' })} />)
    expect(screen.queryByRole('link', { name: 'no-es-correo' })).not.toBeInTheDocument()
  })

  it('oculta el sitio web si el enlace es inseguro', () => {
    render(<FichaMina mina={crearMina(1, { sitio_web: 'javascript:alert(1)' })} />)
    expect(screen.queryByRole('button', { name: 'Sitio web' })).not.toBeInTheDocument()
  })

  it('getStaticPaths genera una ruta por mina y no admite otras', () => {
    const { paths, fallback } = getStaticPaths()
    expect(paths).toHaveLength(leerMinas().length)
    expect(paths[0]).toEqual({ params: { url: leerMinas()[0].slug } })
    expect(fallback).toBe(false)
  })

  it('getStaticProps devuelve la mina o notFound', () => {
    const { slug } = leerMinas()[0]
    expect(getStaticProps({ params: { url: slug } }).props.mina.slug).toBe(slug)
    expect(getStaticProps({ params: { url: 'no-existe' } })).toEqual({ notFound: true })
  })
})
