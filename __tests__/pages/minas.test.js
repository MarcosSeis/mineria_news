import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Minas, { getStaticProps } from '@/pages/minas'
import { crearMina } from '../../test-utils/fixtures'


const minas = [
  crearMina(1, { titulo: 'Peñasquito', estado: 'Zacatecas', minerales: 'Oro, Plata' }),
  crearMina(2, { titulo: 'Cananea', estado: 'Sonora', minerales: 'Cobre' }),
  crearMina(3, { titulo: 'La Herradura', estado: 'Sonora', minerales: 'Oro' })
]
const titulos = () => within(screen.getByRole('main')).queryAllByRole('heading', { level: 3 }).map(h => h.textContent)

describe('Minas', () => {
  it('lista las minas ordenadas alfabéticamente con su conteo', () => {
    render(<Minas minas={minas} />)
    expect(titulos()).toEqual(['Cananea', 'La Herradura', 'Peñasquito'])
    expect(screen.getByText('3 minas')).toBeInTheDocument()
  })

  it('filtra por estado, mineral y búsqueda', async () => {
    render(<Minas minas={minas} />)
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'Sonora')
    expect(titulos()).toEqual(['Cananea', 'La Herradura'])
    await userEvent.selectOptions(screen.getByLabelText('Mineral'), 'Oro')
    expect(titulos()).toEqual(['La Herradura'])
    expect(screen.getByText('1 mina')).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Estado'), '')
    await userEvent.selectOptions(screen.getByLabelText('Mineral'), '')
    await userEvent.type(screen.getByLabelText('Buscar'), 'penasquito')
    expect(titulos()).toEqual(['Peñasquito'])
  })

  it('avisa cuando ninguna mina coincide', async () => {
    render(<Minas minas={minas} />)
    await userEvent.type(screen.getByLabelText('Buscar'), 'zzz')
    expect(screen.getByText('Ninguna mina coincide con la búsqueda.')).toBeInTheDocument()
  })

  it('muestra un mensaje si el directorio está vacío', () => {
    render(<Minas minas={[]} />)
    expect(screen.getByText('Todavía no hay minas en el directorio.')).toBeInTheDocument()
  })

  it('muestra el aviso de información referencial', () => {
    render(<Minas minas={minas} />)
    expect(screen.getByText(/Información referencial/)).toBeInTheDocument()
  })

  it('getStaticProps carga las minas del archivo de datos', () => {
    const { props } = getStaticProps()
    expect(props.minas.length).toBeGreaterThan(0)
  })
})
