import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import Header from '@/components/header'
import { congelarFecha, descongelarFecha } from '../../test-utils/fixtures'

beforeEach(() => congelarFecha())
afterEach(() => descongelarFecha())

describe('Header', () => {
  it('muestra la fecha y hora después de montar (sin desajuste de hidratación)', () => {
    render(<Header />)
    expect(screen.getAllByText(/Actualizado/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/oct/i).length).toBeGreaterThan(0)
  })

  it('tiene un único h1 y un solo banner', () => {
    render(<Header />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByAltText(/Convención Minera/)).toHaveLength(1)
  })

  it('el banner abre la convención en una pestaña nueva de forma segura', () => {
    render(<Header />)
    const enlace = screen.getByAltText(/Convención Minera/).closest('a')
    expect(enlace).toHaveAttribute('href', 'https://convencionmineramexico.mx/')
    expect(enlace).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('el botón de menú alterna aria-expanded', async () => {
    render(<Header />)
    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('incluye navegación y contacto', () => {
    render(<Header />)
    expect(screen.getAllByRole('link', { name: 'Noticias' })).toHaveLength(2)
    expect(screen.getByText(/Contacto: infominerianews@gmail.com/)).toBeInTheDocument()
  })

  it('en el servidor no imprime fecha, para que coincida con la hidratación', () => {
    const html = renderToString(<Header />)
    expect(html).not.toMatch(/Actualizado/)
    expect(html).toMatch(/Minería News/)
  })
})
