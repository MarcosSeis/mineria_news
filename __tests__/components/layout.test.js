import { render, screen } from '@testing-library/react'
import Layout from '@/components/layout'

describe('Layout', () => {
  it('renderiza header, contenido y footer', () => {
    render(<Layout title="Inicio"><p>contenido</p></Layout>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getAllByText('Minería News').length).toBeGreaterThan(0)
    expect(screen.getByText(/© MINERÍA NEWS/)).toBeInTheDocument()
  })

  it('define título, meta description válida y Open Graph', () => {
    const { container } = render(<Layout title="Noticias" description="Una descripción"><span /></Layout>)
    expect(document.querySelector('title')).toHaveTextContent('Minería News - Noticias')
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Una descripción')
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Minería News - Noticias')
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute('content', 'Una descripción')
  })

  it('usa solo el nombre del sitio si no hay título', () => {
    const { container } = render(<Layout><span /></Layout>)
    expect(document.querySelector('title')).toHaveTextContent(/^Minería News$/)
  })
})
