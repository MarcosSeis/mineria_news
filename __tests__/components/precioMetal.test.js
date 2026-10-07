import { render, screen } from '@testing-library/react'
import PrecioMetal from '@/components/precioMetal'

describe('PrecioMetal', () => {
  it('enlaza a la gráfica del metal', () => {
    render(<PrecioMetal metal={{ symbol: 'XAU', nombre: 'Oro', unidad: 'USD / onza troy', precio: 4146.5 }} />)
    const enlace = screen.getByRole('link', { name: 'Ver gráfica de Oro' })
    expect(enlace).toHaveAttribute('href', '/metales?metal=XAU#grafica')
    expect(enlace).toHaveTextContent('$4,146.50')
  })
})
