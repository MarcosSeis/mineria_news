import { render, screen } from '@testing-library/react'
import Juegos from '@/pages/juegos'

describe('Juegos (sección)', () => {
  it('muestra el título de la página y la sección', () => {
    render(<Juegos />)
    expect(screen.getByRole('heading', { level: 1, name: 'Juegos' })).toBeInTheDocument()
    expect(document.querySelector('title')).toHaveTextContent('Minería News - Juegos')
  })

  it('lista los dos juegos con su enlace', () => {
    render(<Juegos />)
    expect(screen.getByRole('link', { name: /Mineral Wordle/ })).toHaveAttribute('href', '/mineral-wordle')
    expect(screen.getByRole('link', { name: /La Voladura/ })).toHaveAttribute('href', '/la-voladura')
    expect(screen.getAllByText(/Jugar/)).toHaveLength(2)
  })
})
