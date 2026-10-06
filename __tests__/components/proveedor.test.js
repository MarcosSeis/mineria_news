import { render, screen } from '@testing-library/react'
import Proveedor from '@/components/proveedor'
import { crearProveedor } from '../../test-utils/fixtures'

describe('Proveedor', () => {
  it('muestra todos los datos y enlaces seguros', () => {
    const { container } = render(<Proveedor proveedor={crearProveedor(1).acf} />)
    expect(screen.getByText('Proveedor 1')).toBeInTheDocument()
    expect(screen.getByText('555-0000')).toBeInTheDocument()
    expect(screen.getByText('Calle 1, CDMX')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'contacto1@proveedor.test' })).toHaveAttribute('href', 'mailto:contacto1@proveedor.test')
    screen.getAllByRole('link', { name: /proveedor1\.test|^$/ }).forEach(a => {
      if (a.getAttribute('href').startsWith('http')) {
        expect(a).toHaveAttribute('target', '_blank')
        expect(a).toHaveAttribute('rel', 'noopener noreferrer')
      }
    })
    expect(container.querySelector('div[style]').style.backgroundImage).toBe('url("https://minasapi.space/logo-1.png")')
  })

  it('no enlaza ni pinta logo cuando las URLs son inseguras', () => {
    const { container } = render(
      <Proveedor proveedor={crearProveedor(1, undefined, { web: 'javascript:alert(1)', logo: 'javascript:x', correo: '' }).acf} />
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument()
    expect(container.querySelector('div[style]')).toBeNull()
  })
})
