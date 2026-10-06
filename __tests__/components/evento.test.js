import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Evento from '@/components/evento'
import { crearEvento } from '../../test-utils/fixtures'

describe('Evento', () => {
  it('muestra título, horario y días de inicio y fin', () => {
    render(<Evento evento={crearEvento(1, '20261012', '20261014').acf} />)
    expect(screen.getAllByText('Evento 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/9:00 - 18:00/).length).toBeGreaterThan(0)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
  })

  it('el encabezado es un botón accesible que despliega y oculta el detalle', async () => {
    const { container } = render(<Evento evento={crearEvento(1, '20261012').acf} />)
    const boton = screen.getByRole('button')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('.lista_desplegable_visible')).toBeNull()

    await userEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(container.querySelector('.lista_desplegable_visible')).not.toBeNull()

    await userEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('se puede activar con teclado', async () => {
    render(<Evento evento={crearEvento(1, '20261012').acf} />)
    const boton = screen.getByRole('button')
    boton.focus()
    await userEvent.keyboard('{Enter}')
    expect(boton).toHaveAttribute('aria-expanded', 'true')
  })

  it('los enlaces externos usan rel seguro', () => {
    render(<Evento evento={crearEvento(1, '20261012').acf} />)
    const pagina = screen.getByRole('link', { name: 'Abrir página del evento' })
    const calendario = screen.getByRole('link', { name: 'Google Calendar' })
    ;[pagina, calendario].forEach(a => {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('omite enlaces inseguros y no falla con datos faltantes', () => {
    render(<Evento evento={crearEvento(1, 'mala', undefined, {
      pagina_evento: 'javascript:alert(1)', calendario_google: undefined, imagen: ''
    }).acf} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
