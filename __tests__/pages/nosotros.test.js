import { render, screen } from '@testing-library/react'
import Nosotros from '@/pages/nosotros'

describe('Nosotros', () => {
  it('muestra el encabezado, la descripción del portal y el título de la página', () => {
    const { container } = render(<Nosotros />)
    expect(screen.getByRole('heading', { level: 1, name: 'Nosotros' })).toBeInTheDocument()
    expect(screen.getAllByText(/portal web especializado en temas de minería/, { selector: 'p' }).length).toBeGreaterThan(0)
    expect(document.querySelector('title')).toHaveTextContent('Minería News - Nosotros')
  })
})
