import { render, screen } from '@testing-library/react'
import Mina from '@/components/mina'
import { crearMina } from '../../test-utils/fixtures'

describe('Mina', () => {
  it('muestra los datos y enlaza a la ficha', () => {
    const { acf, slug } = crearMina(1)
    render(<Mina mina={acf} id={slug} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/minas/mina-1')
    expect(screen.getByRole('heading', { level: 3, name: 'Mina 1' })).toBeInTheDocument()
    expect(screen.getByText('Zacatecas · En operación')).toBeInTheDocument()
    expect(screen.getByText('Empresa 1')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map(li => li.textContent)).toEqual(['Oro', 'Plata'])
  })

  it('se muestra con datos mínimos', () => {
    render(<Mina mina={{ titulo: 'Solo nombre' }} id="solo-nombre" />)
    expect(screen.getByRole('heading', { name: 'Solo nombre' })).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
