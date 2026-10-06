import { render, screen } from '@testing-library/react'
import Anuncio from '@/components/anuncio'

describe('Anuncio', () => {
  it('muestra la imagen con alt y enlace seguro', () => {
    render(<Anuncio ruta="/img/a.png" link="https://a.com" alt="Marca A" />)
    expect(screen.getByAltText('Marca A')).toHaveAttribute('src', '/img/a.png')
    const enlace = screen.getByRole('link')
    expect(enlace).toHaveAttribute('href', 'https://a.com')
    expect(enlace).toHaveAttribute('target', '_blank')
    expect(enlace).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('usa alt por defecto y aplica la clase de fondo solo cuando se pide', () => {
    const { rerender } = render(<Anuncio ruta="/a.png" link="https://a.com" />)
    expect(screen.getByAltText('Anuncio').className).toBe('')
    rerender(<Anuncio ruta="/a.png" link="https://a.com" fondo />)
    expect(screen.getByAltText('Anuncio').className).toBe('bgn')
  })
})
