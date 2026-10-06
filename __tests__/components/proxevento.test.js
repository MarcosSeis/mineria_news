import { render, screen } from '@testing-library/react'
import Proxevento from '@/components/proxevento'
import { crearEvento } from '../../test-utils/fixtures'

describe('Proxevento', () => {
  it('muestra datos del evento con fechas legibles y enlace seguro', () => {
    render(<Proxevento evento={crearEvento(1, '20261110', '20261112').acf} />)
    expect(screen.getByRole('heading', { name: 'Evento 1' })).toBeInTheDocument()
    expect(screen.getByText(/10 de noviembre de 2026 - 12 de noviembre de 2026/)).toBeInTheDocument()
    expect(screen.getByText('Ubicación: Acapulco')).toBeInTheDocument()
    expect(screen.getByText('Detalles 1')).toBeInTheDocument()
    expect(screen.getByAltText('Imagen Evento 1')).toBeInTheDocument()
    const enlace = screen.getByRole('link')
    expect(enlace).toHaveAttribute('href', 'https://evento1.test/')
    expect(enlace).toHaveAttribute('target', '_blank')
    expect(enlace).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('no crea enlace si la URL es insegura o falta', () => {
    const { rerender } = render(<Proxevento evento={crearEvento(1, '20261110', '20261110', { pagina_evento: 'javascript:alert(1)' }).acf} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Evento 1' })).toBeInTheDocument()
    rerender(<Proxevento evento={crearEvento(1, '20261110', '20261110', { pagina_evento: undefined }).acf} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('no falla sin imagen', () => {
    render(<Proxevento evento={crearEvento(1, '20261110', '20261110', { imagen: '' }).acf} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
