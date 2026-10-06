import { render, screen } from '@testing-library/react'
import LinksNav from '@/components/linksNav'

describe('LinksNav', () => {
  it.each([
    ['Inicio', '/'], ['Nosotros', '/nosotros'], ['Noticias', '/noticias'],
    ['Eventos', '/eventos'], ['Proveedores', '/proveedores'], ['Bolsa de trabajo', '/trabajos']
  ])('enlace "%s" apunta a %s', (texto, href) => {
    render(<LinksNav />)
    expect(screen.getByRole('link', { name: texto })).toHaveAttribute('href', href)
  })
})
