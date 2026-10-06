import { render, screen } from '@testing-library/react'
import Proveedores, { getStaticProps } from '@/pages/proveedores'
import { fetchList } from '@/lib/api'
import { crearProveedor } from '../../test-utils/fixtures'

jest.mock('@/lib/api')
afterEach(() => jest.resetAllMocks())

describe('Proveedores', () => {
  it('lista los proveedores más recientes primero', () => {
    render(<Proveedores proveedores={[
      crearProveedor(1, '2026-01-01'), crearProveedor(2, '2026-06-01'), crearProveedor(3, '2026-03-01')
    ]} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Proveedores Premium' })).toBeInTheDocument()
    expect(screen.getAllByText(/^\s*Proveedor \d$/).map(e => e.textContent.trim())).toEqual(['Proveedor 2', 'Proveedor 3', 'Proveedor 1'])
  })

  it('renderiza sin proveedores', () => {
    render(<Proveedores proveedores={[]} />)
    expect(screen.queryByText(/Proveedor \d/)).not.toBeInTheDocument()
  })

  it('getStaticProps usa la API y revalida', async () => {
    fetchList.mockResolvedValue([])
    expect(await getStaticProps()).toEqual({ props: { proveedores: [] }, revalidate: 10 })
    expect(fetchList).toHaveBeenCalledWith('proveedor')
  })
})
