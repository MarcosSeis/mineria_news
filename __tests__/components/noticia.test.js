import { render, screen } from '@testing-library/react'
import Post from '@/components/noticia'

const post = { titulo: 'Gran hallazgo', contenido: 'Resumen', imagen: 'https://res.cloudinary.com/x.jpg' }

describe('Noticia (Post)', () => {
  it('muestra título, resumen, fecha formateada e imagen enlazada a la noticia', () => {
    render(<Post post={post} id="gran-hallazgo" date="2026-10-01T10:00:00" />)
    expect(screen.getByRole('heading', { name: 'Gran hallazgo' })).toBeInTheDocument()
    expect(screen.getByText('Resumen')).toBeInTheDocument()
    expect(screen.getByText(/01 de octubre de 2026/)).toBeInTheDocument()
    expect(screen.getByAltText('Imagen Gran hallazgo')).toBeInTheDocument()
    screen.getAllByRole('link').forEach(a => expect(a).toHaveAttribute('href', '/noticias/gran-hallazgo'))
  })

  it('prefiere el campo resumen sobre el contenido completo', () => {
    render(<Post post={{ ...post, contenido: 'Texto completo larguísimo', resumen: 'Resumen editorial' }} id="x" date="2026-10-01" />)
    expect(screen.getByText('Resumen editorial')).toBeInTheDocument()
    expect(screen.queryByText('Texto completo larguísimo')).not.toBeInTheDocument()
  })

  it('no renderiza imagen si no existe', () => {
    render(<Post post={{ ...post, imagen: '' }} id="x" date="2026-10-01" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
