import { render, screen } from '@testing-library/react'
import MineralWordlePage from '@/pages/mineral-wordle'

describe('Mineral Wordle (página)', () => {
  it('muestra el encabezado y el título de la página', () => {
    render(<MineralWordlePage />)
    expect(screen.getByRole('heading', { level: 1, name: /Mineral Wordle/ })).toHaveTextContent('Mineral Wordle')
    expect(document.querySelector('title')).toHaveTextContent('Minería News - Mineral Wordle')
  })
})
